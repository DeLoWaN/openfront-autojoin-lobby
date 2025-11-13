// ==UserScript==
// @name         OpenFrontIO Auto-Join Lobby
// @namespace    http://tampermonkey.net/
// @version      1.4.6
// @description  Auto-join lobbies based on game mode preferences (FFA, Team with all team configurations, player filters). Tested and 100% functional against OpenFront v0.26.16
// @author       DeLoVaN
// @homepageURL  https://github.com/DeLoWaN/openfront-autojoin-lobby
// @match        https://openfront.io/*
// @match        https://*.openfront.io/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Tested and 100% functional against OpenFront v0.26.16

    // Configuration
    const CONFIG = {
        pollInterval: 1000, // ms - how often to check for matching lobbies
        rootURL: 'https://openfront.io/' // Root URL for lobby detection
    };

    // State
    let autoJoinEnabled = false; // Always start with OFF
    let criteriaList = []; // List of criteria (can contain multiple modes)
    let monitoringInterval = null;
    let timerInterval = null;
    let gameInfoInterval = null; // Interval for updating current game info display
    let joinedLobbies = new Set(); // To avoid double joins
    let searchStartTime = null; // Timestamp when auto-join search started
    let gameFoundTime = null; // Timestamp when game was found (for fixed timer display)
    let isJoining = false; // Prevent concurrent join attempts
    let soundEnabled = true; // Sound notification enabled by default
    let recentlyLeftLobbyID = null; // Track lobby ID that was just left to prevent auto-rejoin
    let joinMode = 'autojoin'; // 'autojoin' or 'notify'
    let notifiedLobbies = new Set(); // Track lobbies we've notified about
    let lastNotifiedGameID = null; // Track the last game we notified about (for timer reset)
    let notificationTimeout = null; // Timeout for auto-dismissing notification
    let gameFoundAudio = null; // Preloaded audio for game found notification
    let gameStartAudio = null; // Preloaded audio for game start bell

    // Load settings from storage
    function loadSettings() {
        const saved = GM_getValue('autoJoinSettings', null);
        if (saved) {
            // Always start with auto-join OFF, even if it was saved as enabled
            autoJoinEnabled = false;
            criteriaList = saved.criteria || [];
            soundEnabled = saved.soundEnabled !== undefined ? saved.soundEnabled : true;
            joinMode = saved.joinMode || 'autojoin'; // Default to 'autojoin' for backward compatibility
        }
    }

    // Save settings to storage
    function saveSettings() {
        GM_setValue('autoJoinSettings', {
            enabled: autoJoinEnabled,
            criteria: criteriaList,
            soundEnabled: soundEnabled,
            joinMode: joinMode
        });
    }

    // Update search timer display
    function updateSearchTimer() {
        const timerElement = document.getElementById('search-timer');
        if (!timerElement) return;

        if (!autoJoinEnabled || searchStartTime === null) {
            timerElement.style.display = 'none';
            gameFoundTime = null;
            return;
        }

        // If game was found, show fixed time
        if (gameFoundTime !== null) {
            const elapsed = Math.floor((gameFoundTime - searchStartTime) / 1000); // seconds
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerElement.textContent = `Game found! (${minutes}m ${seconds}s)`;
            timerElement.style.display = 'inline';
            return;
        }

        // Otherwise show live timer
        const elapsed = Math.floor((Date.now() - searchStartTime) / 1000); // seconds
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        timerElement.textContent = `Searching: ${minutes}m ${seconds}s`;
        timerElement.style.display = 'inline';
    }

    // Update current game info display (players per team for team games)
    function updateCurrentGameInfo() {
        const gameInfoElement = document.getElementById('current-game-info');
        if (!gameInfoElement) return;

        // Only show on lobby page
        if (!isOnLobbyPage()) {
            gameInfoElement.style.display = 'none';
            return;
        }

        // Always show the element to avoid resizing, but update content based on game type
        gameInfoElement.style.display = 'block';

        // Get current displayed lobby
        const publicLobby = document.querySelector('public-lobby');
        if (!publicLobby || !publicLobby.lobbies || !Array.isArray(publicLobby.lobbies) || publicLobby.lobbies.length === 0) {
            gameInfoElement.textContent = 'Current game: No game';
            gameInfoElement.classList.add('not-applicable');
            return;
        }

        const currentLobby = publicLobby.lobbies[0];
        if (!currentLobby || !currentLobby.gameConfig) {
            gameInfoElement.textContent = 'Current game: No game';
            gameInfoElement.classList.add('not-applicable');
            return;
        }

        const config = currentLobby.gameConfig;
        
        // Check if it's a team game
        if (config.gameMode !== 'Team') {
            gameInfoElement.textContent = 'Current game: Not a team game';
            gameInfoElement.classList.add('not-applicable');
            return;
        }

        // Get game capacity
        const gameCapacity = currentLobby.maxClients || config.maxClients || config.maxPlayers || null;
        if (gameCapacity === null) {
            gameInfoElement.textContent = 'Current game: Capacity unknown';
            gameInfoElement.classList.add('not-applicable');
            return;
        }

        // Get team configuration
        const playerTeams = config.playerTeams;
        
        // Display the info for team games
        // For Duos/Trios/Quads, show the mode name directly
        if (playerTeams === 'Duos') {
            gameInfoElement.textContent = 'Current game: Duos';
            gameInfoElement.classList.remove('not-applicable');
        } else if (playerTeams === 'Trios') {
            gameInfoElement.textContent = 'Current game: Trios';
            gameInfoElement.classList.remove('not-applicable');
        } else if (playerTeams === 'Quads') {
            gameInfoElement.textContent = 'Current game: Quads';
            gameInfoElement.classList.remove('not-applicable');
        } else if (playerTeams === 'Humans Vs Nations') {
            gameInfoElement.textContent = 'Current game: Humans Vs Nations';
            gameInfoElement.classList.remove('not-applicable');
        } else if (typeof playerTeams === 'number') {
            // For modes with number of teams, show players per team
            const playersPerTeam = getPlayersPerTeam(playerTeams, gameCapacity);
            if (playersPerTeam === null) {
                gameInfoElement.textContent = 'Current game: Team configuration unknown';
                gameInfoElement.classList.add('not-applicable');
                return;
            }
            gameInfoElement.textContent = `Current game: ${playersPerTeam} players per team (${playerTeams} teams)`;
            gameInfoElement.classList.remove('not-applicable');
        } else {
            gameInfoElement.textContent = 'Current game: Team configuration unknown';
            gameInfoElement.classList.add('not-applicable');
        }
    }

    // Helper function to get players per team from playerTeams
    // When playerTeams is a string like 'Quads', 'Trios', 'Duos', it represents players per team directly
    // When playerTeams is a number, it represents the number of teams, so we calculate players per team
    function getPlayersPerTeam(playerTeams, gameCapacity) {
        // String values represent players per team directly
        if (playerTeams === 'Duos') return 2;
        if (playerTeams === 'Trios') return 3;
        if (playerTeams === 'Quads') return 4;
        if (playerTeams === 'Humans Vs Nations') {
            // Typically 2 teams, so calculate players per team
            return Math.floor(gameCapacity / 2);
        }
        // Number values represent the number of teams
        if (typeof playerTeams === 'number' && playerTeams > 0) {
            return Math.floor(gameCapacity / playerTeams);
        }
        return null;
    }

    // Check if lobby matches criteria
    function matchesCriteria(lobby, criteriaList) {
        if (!lobby || !lobby.gameConfig || !criteriaList || criteriaList.length === 0) {
            return false;
        }

        const config = lobby.gameConfig;
        // Get game capacity (max players the game can hold)
        // Try common property names for capacity
        const gameCapacity = lobby.maxClients || config.maxClients || config.maxPlayers || null;

        // Check if lobby matches at least one criterion
        for (const criteria of criteriaList) {
            let matches = false;

            if (criteria.gameMode === 'FFA') {
                if (config.gameMode !== 'Free For All') {
                    continue; // Move to next criterion
                }
                matches = true;
            } else if (criteria.gameMode === 'Team') {
                if (config.gameMode !== 'Team') {
                    continue;
                }

                // If a team count is specified, check it
                if (criteria.teamCount !== null && criteria.teamCount !== undefined) {
                    const playerTeams = config.playerTeams;

                    // Handle special modes
                    // Note: Duos/Trios/Quads are game modes (players per team), NOT team counts
                    // They should only match their exact string values, not numeric team counts
                    if (criteria.teamCount === 'Duos') {
                        if (playerTeams !== 'Duos') {
                            continue;
                        }
                    } else if (criteria.teamCount === 'Trios') {
                        if (playerTeams !== 'Trios') {
                            continue;
                        }
                    } else if (criteria.teamCount === 'Quads') {
                        if (playerTeams !== 'Quads') {
                            continue;
                        }
                    } else if (criteria.teamCount === 'Humans Vs Nations') {
                        if (playerTeams !== 'Humans Vs Nations') {
                            continue;
                        }
                    } else if (typeof criteria.teamCount === 'number') {
                        if (playerTeams !== criteria.teamCount) {
                            continue;
                        }
                    }
                }

                matches = true;
            }

            // If mode matches, check player filters
            if (matches) {
                if (criteria.gameMode === 'FFA') {
                    // For FFA, check based on game capacity (total players)
                    if (gameCapacity === null) {
                        // No capacity info available, skip capacity filtering
                        return true;
                    }

                    // Check minPlayers (minimum game capacity)
                    if (criteria.minPlayers !== null && criteria.minPlayers !== undefined) {
                        if (gameCapacity < criteria.minPlayers) {
                            continue; // Game capacity is less than minimum required
                        }
                    }

                    // Check maxPlayers (maximum game capacity)
                    if (criteria.maxPlayers !== null && criteria.maxPlayers !== undefined) {
                        if (gameCapacity > criteria.maxPlayers) {
                            continue; // Game capacity exceeds maximum allowed
                        }
                    }
                } else if (criteria.gameMode === 'Team') {
                    // For Team games, check based on players per team
                    // BUT: Duos/Trios/Quads always have 2/3/4 players per team by definition,
                    // so we skip the players per team filter for these modes
                    const playerTeams = config.playerTeams;
                    const isFixedPlayersPerTeam = playerTeams === 'Duos' || playerTeams === 'Trios' || playerTeams === 'Quads';
                    
                    // Only apply players per team filter for modes with number of teams (2/3/4/5/6/7 teams)
                    if (!isFixedPlayersPerTeam) {
                        if (gameCapacity === null) {
                            // No capacity info available, skip capacity filtering
                            return true;
                        }

                        // Get players per team
                        const playersPerTeam = getPlayersPerTeam(playerTeams, gameCapacity);
                        
                        if (playersPerTeam === null) {
                            // Cannot determine players per team, skip capacity filtering
                            return true;
                        }

                        // Check minPlayers (minimum players per team)
                        if (criteria.minPlayers !== null && criteria.minPlayers !== undefined) {
                            if (playersPerTeam < criteria.minPlayers) {
                                continue; // Players per team is less than minimum required
                            }
                        }

                        // Check maxPlayers (maximum players per team)
                        if (criteria.maxPlayers !== null && criteria.maxPlayers !== undefined) {
                            if (playersPerTeam > criteria.maxPlayers) {
                                continue; // Players per team exceeds maximum allowed
                            }
                        }
                    }
                    // For Duos/Trios/Quads, skip players per team filtering (always 2/3/4 by definition)
                }

                // All criteria satisfied
                return true;
            }
        }

        // No criterion matches
        return false;
    }

    // Helper function to check if we're on the lobby page (allowing hash/path variations)
    function isOnLobbyPage() {
        try {
            // Parse the configured root URL
            const configUrl = new URL(CONFIG.rootURL);
            const configOrigin = configUrl.origin;
            const configHostname = configUrl.hostname;

            // Get current location base
            const currentOrigin = window.location.origin;
            const currentHostname = window.location.hostname;

            // Check if origins/hostnames match
            if (currentOrigin !== configOrigin && currentHostname !== configHostname) {
                return false;
            }

            // Get current pathname and hash (normalize)
            const currentPath = window.location.pathname;
            const currentHash = window.location.hash;

            // Normalize path: remove trailing slashes and check if it's root or lobby-related
            const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
            const isRootPath = normalizedPath === '/';

            // Check if path is a lobby-related path suffix (e.g., /public-lobby)
            const isLobbyPath = normalizedPath === '/public-lobby' || normalizedPath.startsWith('/public-lobby/');

            // Allow hash fragments like #/public-lobby or empty hash
            const isLobbyHash = !currentHash || currentHash === '#' || currentHash === '#/public-lobby' || currentHash.startsWith('#/public-lobby/');

            // Consider it the lobby page if:
            // 1. Origin/hostname matches AND
            // 2. Either:
            //    - Path is root/empty AND hash is empty or lobby-related, OR
            //    - Path is a lobby path (path-based routing, hash doesn't matter)
            return (isRootPath && isLobbyHash) || isLobbyPath;
        } catch (error) {
            // Fallback to strict comparison if URL parsing fails
            console.warn('[Auto-Join] Error checking lobby page, using fallback:', error);
            return location.href === CONFIG.rootURL;
        }
    }

    // Check lobbies and auto-join if match found
    async function checkLobbies() {
        try {
            // Always update current game info display
            updateCurrentGameInfo();

            // Prevent concurrent join attempts
            if (isJoining) {
                return;
            }

            // Check if we have criteria
            if (!criteriaList || criteriaList.length === 0) {
                console.warn('[Auto-Join] No criteria configured. Please select at least one game mode.');
                return;
            }

            // Check we're not already in a game
            if (!isOnLobbyPage()) {
                return;
            }

            // Get lobbies from the public-lobby component
            const publicLobby = document.querySelector('public-lobby');
            if (!publicLobby || !publicLobby.lobbies || !Array.isArray(publicLobby.lobbies)) {
                return; // Component not ready yet
            }
            const lobbies = publicLobby.lobbies;

            // In notify mode, check if we need to reset the timer when a new game appears
            if (joinMode === 'notify' && gameFoundTime !== null && lastNotifiedGameID !== null) {
                // Check if the currently displayed lobby is different from the one we notified about
                const currentLobby = lobbies.length > 0 ? lobbies[0] : null;
                const currentLobbyID = currentLobby ? currentLobby.gameID : null;
                
                // If current lobby is different from the one we notified about, reset timer and continue searching
                if (currentLobbyID !== lastNotifiedGameID) {
                    console.log('[Auto-Join] Different game displayed, resuming search timer');
                    gameFoundTime = null;
                    lastNotifiedGameID = null;
                    // Restart timer if it was stopped
                    if (!timerInterval) {
                        timerInterval = setInterval(() => {
                            updateSearchTimer();
                        }, 1000);
                    }
                    updateSearchTimer();
                    updateUI({ status: null });
                }
            }

            // Search for a lobby matching criteria
            for (const lobby of lobbies) {
                // Debug: Log lobby structure once to identify capacity property
                if (lobbies.indexOf(lobby) === 0 && lobbies.length > 0) {
                    console.log('[Auto-Join] Debug - Lobby structure:', {
                        lobbyKeys: Object.keys(lobby),
                        gameConfigKeys: lobby.gameConfig ? Object.keys(lobby.gameConfig) : null,
                        maxClients: lobby.maxClients,
                        configMaxClients: lobby.gameConfig?.maxClients,
                        configMaxPlayers: lobby.gameConfig?.maxPlayers
                    });
                }

                if (matchesCriteria(lobby, criteriaList)) {
                    // Skip if this is the lobby we just left (permanently block auto-rejoin)
                    if (recentlyLeftLobbyID === lobby.gameID) {
                        continue;
                    }
                    
                    if (joinMode === 'notify') {
                        // Notify mode: show notification instead of joining
                        if (!notifiedLobbies.has(lobby.gameID)) {
                            console.log('[Auto-Join] Game found (notify mode):', lobby.gameID);
                            showGameFoundNotification(lobby);
                            playGameFoundSound(); // Chime when match is found
                            notifiedLobbies.add(lobby.gameID);
                            // Mark that game was found and stop timer updates
                            gameFoundTime = Date.now();
                            lastNotifiedGameID = lobby.gameID;
                            stopTimer();
                            updateSearchTimer();
                            // Update UI status
                            updateUI({ status: 'found', gameID: lobby.gameID });
                            return; // Only notify about one lobby at a time
                        }
                    } else {
                        // Auto-join mode: existing behavior
                        // Check we haven't already joined this lobby
                        if (!joinedLobbies.has(lobby.gameID)) {
                            console.log('[Auto-Join] Joining lobby:', lobby.gameID);
                            joinLobby(lobby);
                            joinedLobbies.add(lobby.gameID);
                            // Clear recently left lobby ID since we're joining a different one
                            recentlyLeftLobbyID = null;
                            return; // Only join one lobby at a time
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[Auto-Join] Error checking lobbies:', error);
        }
    }


    // Preload audio files for better performance
    function preloadSounds() {
        try {
            gameFoundAudio = new Audio('https://github.com/DeLoWaN/openfront-autojoin-lobby/raw/refs/heads/main/notification_sounds/new-notification-014-363678.mp3');
            gameFoundAudio.volume = 0.5;
            gameFoundAudio.preload = 'auto';
            
            gameStartAudio = new Audio('https://github.com/DeLoWaN/openfront-autojoin-lobby/raw/refs/heads/main/notification_sounds/opening-bell-421471.mp3');
            gameStartAudio.volume = 0.5;
            gameStartAudio.preload = 'auto';
            
            console.log('[Auto-Join] Audio files preloaded');
        } catch (error) {
            console.warn('[Auto-Join] Could not preload audio files:', error);
        }
    }

    // Play sound notification (chime) when a game is found
    function playGameFoundSound() {
        if (!soundEnabled || !gameFoundAudio) return;

        try {
            gameFoundAudio.currentTime = 0; // Reset to start
            gameFoundAudio.play().catch(error => {
                console.warn('[Auto-Join] Could not play game found sound:', error);
            });
        } catch (error) {
            console.warn('[Auto-Join] Could not play game found sound:', error);
        }
    }

    // Play boxing ring bell sound when game starts/joins
    function playGameStartSound() {
        if (!soundEnabled || !gameStartAudio) return;

        try {
            gameStartAudio.currentTime = 0; // Reset to start
            gameStartAudio.play().catch(error => {
                console.warn('[Auto-Join] Could not play game start sound:', error);
            });
        } catch (error) {
            console.warn('[Auto-Join] Could not play game start sound:', error);
        }
    }

    // Get formatted game details text for notification
    function getGameDetailsText(lobby) {
        if (!lobby || !lobby.gameConfig) {
            return 'Game Found!';
        }

        const config = lobby.gameConfig;
        const gameCapacity = lobby.maxClients || config.maxClients || config.maxPlayers || null;

        if (config.gameMode === 'Free For All') {
            if (gameCapacity !== null) {
                return `Game Found! FFA - ${gameCapacity} players`;
            }
            return 'Game Found! FFA';
        } else if (config.gameMode === 'Team') {
            const playerTeams = config.playerTeams;
            
            let teamCountText = '';
            if (playerTeams === 'Duos') {
                teamCountText = 'Duos';
            } else if (playerTeams === 'Trios') {
                teamCountText = 'Trios';
            } else if (playerTeams === 'Quads') {
                teamCountText = 'Quads';
            } else if (playerTeams === 'Humans Vs Nations') {
                teamCountText = 'Humans Vs Nations';
            } else if (typeof playerTeams === 'number') {
                teamCountText = `${playerTeams} teams`;
            } else {
                teamCountText = 'Team';
            }

            // For Duos/Trios/Quads, just show the mode name (always 2/3/4 players per team)
            if (playerTeams === 'Duos' || playerTeams === 'Trios' || playerTeams === 'Quads') {
                return `Game Found! Team (${teamCountText})`;
            }
            
            // For modes with number of teams, show players per team
            if (typeof playerTeams === 'number' && gameCapacity !== null) {
                const playersPerTeam = getPlayersPerTeam(playerTeams, gameCapacity);
                if (playersPerTeam !== null) {
                    return `Game Found! Team (${teamCountText}) - ${playersPerTeam} players per team`;
                }
            }
            
            return `Game Found! Team (${teamCountText})`;
        }

        return 'Game Found!';
    }

    // Dismiss notification
    function dismissNotification(targetElement = null) {
        const elements = targetElement
            ? [targetElement]
            : Array.from(document.querySelectorAll('.game-found-notification'));

        if (elements.length === 0) {
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
                notificationTimeout = null;
            }
            return;
        }

        elements.forEach(element => {
            if (!element.classList.contains('notification-dismissing')) {
                element.classList.add('notification-dismissing');
            }
            setTimeout(() => element.remove(), 300);
        });

        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
    }

    // Show game found notification
    function showGameFoundNotification(lobby) {
        // If notification already exists, dismiss it first (show only latest)
        const existingNotification = document.getElementById('game-found-notification');
        if (existingNotification) {
            dismissNotification(existingNotification);
            // Wait a bit for the dismiss animation
            setTimeout(() => {
                createNewNotification(lobby);
            }, 50);
        } else {
            createNewNotification(lobby);
        }
    }

    // Create new notification element
    function createNewNotification(lobby) {
        const notification = document.createElement('div');
        notification.id = 'game-found-notification';
        notification.className = 'game-found-notification';
        
        const message = getGameDetailsText(lobby);
        notification.textContent = message;
        
        // Click to dismiss
        notification.addEventListener('click', () => dismissNotification(notification));
        
        // Add to body
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('notification-visible');
        }, 10);
        
        // Auto-dismiss after 10 seconds
        notificationTimeout = setTimeout(() => {
            dismissNotification(notification);
        }, 10000);
    }

    // Join a lobby - only join if we can click the button (for visual feedback)
    function joinLobby(lobby) {
        // Prevent concurrent joins
        if (isJoining) {
            console.log('[Auto-Join] Already joining a lobby, skipping');
            return;
        }

        // Try to get the public lobby component and check if the lobby matches
        const publicLobby = document.querySelector('public-lobby');
        const lobbyButton = publicLobby?.querySelector('button');

        // Only join if we can click the button (lobby must be displayed and button enabled)
        if (!publicLobby || !lobbyButton || lobbyButton.disabled) {
            console.log('[Auto-Join] Cannot join: button not available or disabled');
            // Remove from joinedLobbies so we can retry later
            joinedLobbies.delete(lobby.gameID);
            return;
        }

        // Get current displayed lobby (public-lobby shows lobbies[0])
        const currentLobby = publicLobby.lobbies?.[0];
        if (!currentLobby || currentLobby.gameID !== lobby.gameID) {
            console.log('[Auto-Join] Cannot join: lobby not displayed (waiting for it to appear)');
            // Remove from joinedLobbies so we can retry when it becomes visible
            joinedLobbies.delete(lobby.gameID);
            return;
        }

        // All conditions met - proceed with join
        isJoining = true;
        console.log('[Auto-Join] Joining lobby:', lobby.gameID);

        // Mark that game was found and stop timer updates
        gameFoundTime = Date.now();
        stopTimer();
        updateSearchTimer();

        // Play sound notification (chime when match is found)
        playGameFoundSound();

        // Click the button - component will handle join with visual feedback (green highlight)
        lobbyButton.click();

        // Update UI to indicate we joined
        updateUI({ status: 'joined', gameID: lobby.gameID });

        // Reset joining flag after a delay (allows time for join to process)
        setTimeout(() => {
            isJoining = false;
        }, 2000);
    }

    // Start monitoring lobbies
    function startMonitoring() {
        if (monitoringInterval) return; // Already monitoring

        searchStartTime = Date.now();
        gameFoundTime = null; // Reset game found time
        lastNotifiedGameID = null; // Reset last notified game ID
        // Clear notified lobbies when starting new search
        notifiedLobbies.clear();
        updateSearchTimer();

        // Update timer display every second
        timerInterval = setInterval(() => {
            updateSearchTimer();
        }, 1000);

        // Start checking lobbies
        monitoringInterval = setInterval(checkLobbies, CONFIG.pollInterval);
    }

    // Stop monitoring lobbies
    function stopMonitoring() {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
        stopTimer();
        searchStartTime = null;
        gameFoundTime = null;
        lastNotifiedGameID = null;
        updateSearchTimer();
        // Dismiss any active notification
        dismissNotification();
        // Clear notified lobbies
        notifiedLobbies.clear();
        // Reset status to inactive when stopping
        updateUI({ status: null });
    }

    // Stop timer interval
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Start game info update interval
    function startGameInfoUpdates() {
        if (gameInfoInterval) return; // Already running
        
        // Update immediately
        updateCurrentGameInfo();
        
        // Update every second
        gameInfoInterval = setInterval(() => {
            updateCurrentGameInfo();
        }, 1000);
    }

    // Stop game info update interval
    function stopGameInfoUpdates() {
        if (gameInfoInterval) {
            clearInterval(gameInfoInterval);
            gameInfoInterval = null;
        }
        // Hide the display
        const gameInfoElement = document.getElementById('current-game-info');
        if (gameInfoElement) {
            gameInfoElement.style.display = 'none';
        }
    }

    // Update slider visual fill and sync with hidden inputs
    function updateSliderRange(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId) {
        const minSlider = document.getElementById(minSliderId);
        const maxSlider = document.getElementById(maxSliderId);
        const minInput = document.getElementById(minInputId);
        const maxInput = document.getElementById(maxInputId);
        const fill = document.getElementById(fillId);
        const minValueDisplay = document.getElementById(minValueId);
        const maxValueDisplay = document.getElementById(maxValueId);

        if (!minSlider || !maxSlider || !fill) return;

        const minVal = parseInt(minSlider.value, 10);
        const maxVal = parseInt(maxSlider.value, 10);
        const min = parseInt(minSlider.min, 10);
        const max = parseInt(minSlider.max, 10);

        // Ensure min <= max
        if (minVal > maxVal) {
            if (document.activeElement === minSlider) {
                maxSlider.value = minVal;
                if (maxInput) maxInput.value = minVal === max ? '' : minVal;
            } else {
                minSlider.value = maxVal;
                if (minInput) minInput.value = maxVal === min ? '' : maxVal;
            }
            return updateSliderRange(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId);
        }

        // Calculate fill position and width
        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;

        fill.style.left = minPercent + '%';
        fill.style.width = (maxPercent - minPercent) + '%';

        // Update hidden inputs
        if (minInput) {
            minInput.value = minVal === min ? '' : minVal;
        }
        if (maxInput) {
            maxInput.value = maxVal === max ? '' : maxVal;
        }

        // Update displayed values
        if (minValueDisplay) {
            minValueDisplay.textContent = minVal === min ? 'Any' : minVal;
        }
        if (maxValueDisplay) {
            maxValueDisplay.textContent = maxVal === max ? 'Any' : maxVal;
        }
    }

    // Initialize slider from hidden input values
    function initializeSlider(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId) {
        const minSlider = document.getElementById(minSliderId);
        const maxSlider = document.getElementById(maxSliderId);
        const minInput = document.getElementById(minInputId);
        const maxInput = document.getElementById(maxInputId);

        if (!minSlider || !maxSlider) return;

        const min = parseInt(minSlider.min, 10);
        const max = parseInt(minSlider.max, 10);

        // Get values from hidden inputs or use defaults
        let minVal = min;
        let maxVal = max;

        if (minInput && minInput.value) {
            minVal = Math.max(min, Math.min(max, parseInt(minInput.value, 10)));
        }
        if (maxInput && maxInput.value) {
            maxVal = Math.max(min, Math.min(max, parseInt(maxInput.value, 10)));
        }

        // Ensure min <= max
        if (minVal > maxVal) {
            minVal = maxVal;
        }

        minSlider.value = minVal;
        maxSlider.value = maxVal;

        updateSliderRange(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId);
    }

    // Get number value from input
    function getNumberValue(id) {
        const input = document.getElementById(id);
        if (!input || !input.value) return null;
        const value = parseInt(input.value, 10);
        return isNaN(value) ? null : value;
    }

    // Get all selected team counts from UI (returns array)
    function getAllTeamCountValues() {
        const selectedCounts = [];
        const teamCountIds = [
            { id: 'autojoin-team-hvn', value: 'Humans Vs Nations' },
            { id: 'autojoin-team-duos', value: 'Duos' },
            { id: 'autojoin-team-trios', value: 'Trios' },
            { id: 'autojoin-team-quads', value: 'Quads' },
            { id: 'autojoin-team-2', value: 2 },
            { id: 'autojoin-team-3', value: 3 },
            { id: 'autojoin-team-4', value: 4 },
            { id: 'autojoin-team-5', value: 5 },
            { id: 'autojoin-team-6', value: 6 },
            { id: 'autojoin-team-7', value: 7 }
        ];

        teamCountIds.forEach(({ id, value }) => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                selectedCounts.push(value);
            }
        });

        return selectedCounts.length > 0 ? selectedCounts : null;
    }

    // Helper function for select/deselect all team counts
    function setAllTeamCounts(checked) {
        const checkboxes = [
            'autojoin-team-2', 'autojoin-team-3', 'autojoin-team-4', 'autojoin-team-5',
            'autojoin-team-6', 'autojoin-team-7', 'autojoin-team-duos', 'autojoin-team-trios',
            'autojoin-team-quads'
            // 'autojoin-team-hvn' removed from UI (code kept for potential reactivation)
        ];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = checked;
        });
    }

    // Select all team count checkboxes (Humans Vs Nations excluded from UI)
    function selectAllTeamCounts() {
        setAllTeamCounts(true);
    }

    // Deselect all team count checkboxes (Humans Vs Nations excluded from UI)
    function deselectAllTeamCounts() {
        setAllTeamCounts(false);
    }

    // Build criteria list from UI
    function buildCriteriaFromUI() {
        const criteriaList = [];

        // Check FFA
        const ffaChecked = document.getElementById('autojoin-ffa').checked;
        if (ffaChecked) {
            const ffaCriteria = {
                gameMode: 'FFA',
                minPlayers: getNumberValue('autojoin-ffa-min') || null,
                maxPlayers: getNumberValue('autojoin-ffa-max') || null
            };
            criteriaList.push(ffaCriteria);
        }

        // Check Team
        const teamChecked = document.getElementById('autojoin-team').checked;
        if (teamChecked) {
            const selectedTeamCounts = getAllTeamCountValues();
            const minPlayers = getNumberValue('autojoin-team-min') || null;
            const maxPlayers = getNumberValue('autojoin-team-max') || null;

            if (selectedTeamCounts === null) {
                // No specific team counts selected, create one criteria that accepts all Team modes
                const teamCriteria = {
                    gameMode: 'Team',
                    teamCount: null,
                    minPlayers: minPlayers,
                    maxPlayers: maxPlayers
                };
                criteriaList.push(teamCriteria);
            } else {
                // Create a separate criteria for each selected team count
                for (const teamCount of selectedTeamCounts) {
                    // Duos/Trios/Quads are game modes with fixed players per team (2/3/4)
                    // Player per team filters do NOT apply to these modes
                    const isFixedPlayersPerTeam = teamCount === 'Duos' || teamCount === 'Trios' || teamCount === 'Quads';
                    
                    const teamCriteria = {
                        gameMode: 'Team',
                        teamCount: teamCount,
                        // Only include player filters for modes with variable team counts (2/3/4/5/6/7 teams)
                        minPlayers: isFixedPlayersPerTeam ? null : minPlayers,
                        maxPlayers: isFixedPlayersPerTeam ? null : maxPlayers
                    };
                    criteriaList.push(teamCriteria);
                }
            }
        }

        return criteriaList;
    }

    // Update UI based on state
    function updateUI(options = {}) {
        const toggleSwitch = document.getElementById('autojoin-toggle');
        const statusIndicator = document.querySelector('#autojoin-status .status-indicator');
        const statusText = document.querySelector('#autojoin-status .status-text');

        if (toggleSwitch) {
            toggleSwitch.checked = autoJoinEnabled;
        }

        if (statusIndicator) {
            statusIndicator.classList.toggle('active', autoJoinEnabled);
        }

        if (statusText) {
            // Only show "Joined" if explicitly set and auto-join is still enabled
            if (options.status === 'joined' && autoJoinEnabled) {
                statusText.textContent = 'Joined';
            } else if (autoJoinEnabled) {
                // In notify mode, always show "Searching" (timer will show "Game found!" when applicable)
                statusText.textContent = joinMode === 'notify' ? 'Searching' : 'Active';
            } else {
                statusText.textContent = 'Inactive';
            }
        }

        updateSearchTimer();
    }

    // Create UI
    function createUI() {
        // Check if UI already exists
        if (document.getElementById('openfront-autojoin-panel')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'openfront-autojoin-panel';
        panel.className = 'autojoin-panel';
        panel.innerHTML = `
            <div class="autojoin-header" id="autojoin-header-drag">
                <h3>Auto-Join Lobby</h3>
                <label class="toggle-switch">
                    <input type="checkbox" id="autojoin-toggle">
                    <span class="toggle-slider"></span>
                </label>
            </div>

            <div class="autojoin-content">
                <!-- Mode Selector -->
                <div class="join-mode-selector">
                    <label class="mode-radio-label">
                        <input type="radio" name="joinMode" value="autojoin" id="join-mode-autojoin" checked>
                        <span>Auto-Join</span>
                    </label>
                    <label class="mode-radio-label">
                        <input type="radio" name="joinMode" value="notify" id="join-mode-notify">
                        <span>Notify Only</span>
                    </label>
                </div>

                <!-- FFA Section -->
                <div class="autojoin-mode-section">
                    <label class="mode-checkbox-label">
                        <input type="checkbox" id="autojoin-ffa" name="gameMode" value="FFA">
                        <span>FFA</span>
                    </label>

                    <div class="autojoin-mode-config" id="ffa-config" style="display: none;">
                        <div class="player-filter-info">
                            <small>Filter by max players:</small>
                        </div>
                        <div class="capacity-range-wrapper">
                            <div class="capacity-range-visual">
                                <div class="capacity-track">
                                    <div class="capacity-range-fill" id="ffa-range-fill"></div>
                                    <input type="range" id="autojoin-ffa-min-slider" min="1" max="100" value="1" class="capacity-slider capacity-slider-min">
                                    <input type="range" id="autojoin-ffa-max-slider" min="1" max="100" value="100" class="capacity-slider capacity-slider-max">
                                </div>
                                <div class="capacity-labels">
                                    <div class="capacity-label-group">
                                        <label for="autojoin-ffa-min-slider">Min:</label>
                                        <span class="capacity-value" id="ffa-min-value">Any</span>
                                    </div>
                                    <div class="capacity-label-group">
                                        <label for="autojoin-ffa-max-slider">Max:</label>
                                        <span class="capacity-value" id="ffa-max-value">Any</span>
                                    </div>
                                </div>
                            </div>
                            <div class="capacity-inputs-hidden">
                                <input type="number" id="autojoin-ffa-min" min="1" max="100" style="display: none;">
                                <input type="number" id="autojoin-ffa-max" min="1" max="100" style="display: none;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Team Section -->
                <div class="autojoin-mode-section">
                    <label class="mode-checkbox-label">
                        <input type="checkbox" id="autojoin-team" name="gameMode" value="Team">
                        <span>Team</span>
                    </label>

                    <div class="autojoin-mode-config" id="team-config" style="display: none;">
                        <div class="team-count-section">
                            <label style="display: block; margin-bottom: 4px; font-size: 0.9em;">Teams (optional):</label>
                            <div style="display: flex; gap: 4px; margin-bottom: 6px;">
                                <button type="button" id="autojoin-team-select-all" class="select-all-btn">Select All</button>
                                <button type="button" id="autojoin-team-deselect-all" class="select-all-btn">Deselect All</button>
                            </div>
                            <div class="team-count-options">
                                <label><input type="checkbox" id="autojoin-team-duos" value="Duos"> Duos</label>
                                <label><input type="checkbox" id="autojoin-team-trios" value="Trios"> Trios</label>
                                <label><input type="checkbox" id="autojoin-team-quads" value="Quads"> Quads</label>
                                <label><input type="checkbox" id="autojoin-team-2" value="2"> 2 teams</label>
                                <label><input type="checkbox" id="autojoin-team-3" value="3"> 3 teams</label>
                                <label><input type="checkbox" id="autojoin-team-4" value="4"> 4 teams</label>
                                <label><input type="checkbox" id="autojoin-team-5" value="5"> 5 teams</label>
                                <label><input type="checkbox" id="autojoin-team-6" value="6"> 6 teams</label>
                                <label><input type="checkbox" id="autojoin-team-7" value="7"> 7 teams</label>
                                <!-- Humans Vs Nations removed from UI (code kept for potential reactivation) -->
                            </div>
                        </div>
                        <div class="player-filter-warning" id="team-player-filter-warning" style="display: none;">
                            <div class="warning-icon">⚠️</div>
                            <div class="warning-text">
                                <strong>Note:</strong> Player filters don't apply to Duos/Trios/Quads.
                            </div>
                        </div>
                        <div class="player-filter-info">
                            <small>Filter by players per team:</small>
                        </div>
                        <div class="capacity-range-wrapper">
                            <div class="capacity-range-visual">
                                <div class="capacity-track">
                                    <div class="capacity-range-fill" id="team-range-fill"></div>
                                    <input type="range" id="autojoin-team-min-slider" min="0" max="50" value="0" class="capacity-slider capacity-slider-min">
                                    <input type="range" id="autojoin-team-max-slider" min="0" max="50" value="50" class="capacity-slider capacity-slider-max">
                                </div>
                                <div class="capacity-labels">
                                    <div class="capacity-label-group">
                                        <label for="autojoin-team-min-slider">Min:</label>
                                        <span class="capacity-value" id="team-min-value">Any</span>
                                    </div>
                                    <div class="capacity-label-group">
                                        <label for="autojoin-team-max-slider">Max:</label>
                                        <span class="capacity-value" id="team-max-value">Any</span>
                                    </div>
                                </div>
                            </div>
                            <div class="capacity-inputs-hidden">
                                <input type="number" id="autojoin-team-min" min="0" max="50" style="display: none;">
                                <input type="number" id="autojoin-team-max" min="0" max="50" style="display: none;">
                            </div>
                        </div>
                        <div class="current-game-info" id="current-game-info" style="display: none;"></div>
                    </div>
                </div>

                <div class="autojoin-status" id="autojoin-status">
                    <span class="status-label">Status:</span>
                    <span class="status-indicator"></span>
                    <span class="status-text">Inactive</span>
                    <span class="search-timer" id="search-timer" style="display: none;"></span>
                </div>

                <div class="autojoin-settings">
                    <label class="sound-toggle-label">
                        <input type="checkbox" id="autojoin-sound-toggle">
                        <span>🔔 Sound</span>
                    </label>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Make panel draggable
        makePanelDraggable(panel);

        // Setup event listeners
        setupEventListeners();

        // Load saved settings into UI
        loadUIFromSettings();

        // Initialize sliders (in case no saved settings)
        initializeSlider('autojoin-ffa-min-slider', 'autojoin-ffa-max-slider', 'autojoin-ffa-min', 'autojoin-ffa-max', 'ffa-range-fill', 'ffa-min-value', 'ffa-max-value');
        initializeSlider('autojoin-team-min-slider', 'autojoin-team-max-slider', 'autojoin-team-min', 'autojoin-team-max', 'team-range-fill', 'team-min-value', 'team-max-value');

        // Update UI
        updateUI();
    }

    // Make panel draggable
    function makePanelDraggable(panel) {
        const header = document.getElementById('autojoin-header-drag');
        if (!header) return;

        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Load saved position
        const savedPos = GM_getValue('autoJoinPanelPosition', null);
        if (savedPos) {
            panel.style.left = savedPos.x + 'px';
            panel.style.top = savedPos.y + 'px';
            xOffset = savedPos.x;
            yOffset = savedPos.y;
        }

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            // Don't drag when clicking toggle switch or its label
            if (e.target.id === 'autojoin-toggle' || e.target.closest('.toggle-switch')) return;

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                header.style.cursor = 'grabbing';
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                panel.style.left = currentX + 'px';
                panel.style.top = currentY + 'px';
                panel.style.right = 'auto';
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            header.style.cursor = 'grab';

            // Save position
            GM_setValue('autoJoinPanelPosition', { x: xOffset, y: yOffset });
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Toggle switch
        const toggleSwitch = document.getElementById('autojoin-toggle');
        if (toggleSwitch) {
            toggleSwitch.addEventListener('change', () => {
                autoJoinEnabled = toggleSwitch.checked;
                if (autoJoinEnabled) {
                    // Build criteria from UI before starting
                    criteriaList = buildCriteriaFromUI();

                    console.log('[Auto-Join] Starting with criteria:', { criteriaList });

                    // Validate that we have at least one criterion
                    if (!criteriaList || criteriaList.length === 0) {
                        alert('Please select at least one game mode (FFA or Team) before enabling auto-join!');
                        autoJoinEnabled = false;
                        toggleSwitch.checked = false;
                        updateUI();
                        return;
                    }

                    saveSettings();
                    startMonitoring();
                    updateUI();
                } else {
                    stopMonitoring();
                    saveSettings();
                    updateUI();
                }
            });
        }

        // FFA checkbox - show/hide config
        const ffaCheckbox = document.getElementById('autojoin-ffa');
        const ffaConfig = document.getElementById('ffa-config');
        if (ffaCheckbox && ffaConfig) {
            ffaCheckbox.addEventListener('change', () => {
                ffaConfig.style.display = ffaCheckbox.checked ? 'block' : 'none';
                criteriaList = buildCriteriaFromUI();
                saveSettings();
            });
        }

        // Team checkbox - show/hide config
        const teamCheckbox = document.getElementById('autojoin-team');
        const teamConfig = document.getElementById('team-config');
        if (teamCheckbox && teamConfig) {
            teamCheckbox.addEventListener('change', () => {
                teamConfig.style.display = teamCheckbox.checked ? 'block' : 'none';
                criteriaList = buildCriteriaFromUI();
                saveSettings();
            });
        }

        // Select All / Deselect All buttons for team counts
        const selectAllBtn = document.getElementById('autojoin-team-select-all');
        const deselectAllBtn = document.getElementById('autojoin-team-deselect-all');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                selectAllTeamCounts();
                updatePlayerFilterWarning();
                criteriaList = buildCriteriaFromUI();
                saveSettings();
            });
        }
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                deselectAllTeamCounts();
                updatePlayerFilterWarning();
                criteriaList = buildCriteriaFromUI();
                saveSettings();
            });
        }

        // Function to update player filter warning visibility
        function updatePlayerFilterWarning() {
            const warningElement = document.getElementById('team-player-filter-warning');
            if (!warningElement) return;
            
            // Check if any of Duos/Trios/Quads are selected
            const duosCheckbox = document.getElementById('autojoin-team-duos');
            const triosCheckbox = document.getElementById('autojoin-team-trios');
            const quadsCheckbox = document.getElementById('autojoin-team-quads');
            
            const hasSpecialMode = (duosCheckbox && duosCheckbox.checked) ||
                                   (triosCheckbox && triosCheckbox.checked) ||
                                   (quadsCheckbox && quadsCheckbox.checked);
            
            warningElement.style.display = hasSpecialMode ? 'flex' : 'none';
        }

        // Listen to all team count checkbox changes
        const teamCountCheckboxes = [
            'autojoin-team-2', 'autojoin-team-3', 'autojoin-team-4', 'autojoin-team-5',
            'autojoin-team-6', 'autojoin-team-7', 'autojoin-team-duos', 'autojoin-team-trios',
            'autojoin-team-quads'
        ];
        teamCountCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    updatePlayerFilterWarning();
                    criteriaList = buildCriteriaFromUI();
                    saveSettings();
                });
            }
        });
        
        // Initial warning state update
        updatePlayerFilterWarning();

        // Setup slider event listeners
        const sliderPairs = [
            {
                minSlider: 'autojoin-ffa-min-slider',
                maxSlider: 'autojoin-ffa-max-slider',
                minInput: 'autojoin-ffa-min',
                maxInput: 'autojoin-ffa-max',
                fill: 'ffa-range-fill',
                minValue: 'ffa-min-value',
                maxValue: 'ffa-max-value'
            },
            {
                minSlider: 'autojoin-team-min-slider',
                maxSlider: 'autojoin-team-max-slider',
                minInput: 'autojoin-team-min',
                maxInput: 'autojoin-team-max',
                fill: 'team-range-fill',
                minValue: 'team-min-value',
                maxValue: 'team-max-value'
            }
        ];

        sliderPairs.forEach(pair => {
            const minSlider = document.getElementById(pair.minSlider);
            const maxSlider = document.getElementById(pair.maxSlider);

            if (minSlider) {
                minSlider.addEventListener('input', () => {
                    updateSliderRange(pair.minSlider, pair.maxSlider, pair.minInput, pair.maxInput, pair.fill, pair.minValue, pair.maxValue);
                    criteriaList = buildCriteriaFromUI();
                    saveSettings();
                });
            }

            if (maxSlider) {
                maxSlider.addEventListener('input', () => {
                    updateSliderRange(pair.minSlider, pair.maxSlider, pair.minInput, pair.maxInput, pair.fill, pair.minValue, pair.maxValue);
                    criteriaList = buildCriteriaFromUI();
                    saveSettings();
                });
            }
        });

        // Sound toggle
        const soundToggle = document.getElementById('autojoin-sound-toggle');
        if (soundToggle) {
            soundToggle.checked = soundEnabled;
            soundToggle.addEventListener('change', () => {
                soundEnabled = soundToggle.checked;
                saveSettings();
            });
        }

        // Mode selector radio buttons
        const modeRadios = document.querySelectorAll('input[name="joinMode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                joinMode = e.target.value;
                saveSettings();
                // Update UI to reflect mode change
                updateUI();
            });
        });

        // Listen for leave-lobby event - restart search when user manually leaves
        document.addEventListener('leave-lobby', () => {
            if (autoJoinEnabled) {
                console.log('[Auto-Join] Lobby left manually, restarting search');
                // Get the lobby ID that was just left
                // Try to get it from the current lobby display first
                let leftLobbyID = null;
                const publicLobby = document.querySelector('public-lobby');
                if (publicLobby && publicLobby.lobbies && publicLobby.lobbies.length > 0) {
                    const currentLobby = publicLobby.lobbies[0];
                    if (currentLobby && currentLobby.gameID) {
                        leftLobbyID = currentLobby.gameID;
                    }
                }
                // If not found in display, check joinedLobbies before clearing
                if (!leftLobbyID && joinedLobbies.size > 0) {
                    // Get the first (and likely only) lobby ID from the set
                    leftLobbyID = Array.from(joinedLobbies)[0];
                }
                if (leftLobbyID) {
                    recentlyLeftLobbyID = leftLobbyID;
                    console.log('[Auto-Join] Tracking left lobby ID (permanently blocked from auto-rejoin):', recentlyLeftLobbyID);
                }
                // Clear joined lobbies to allow rejoining other lobbies
                joinedLobbies.clear();
                // Clear notified lobbies
                notifiedLobbies.clear();
                // Reset game found time
                gameFoundTime = null;
                lastNotifiedGameID = null;
                // Restart monitoring (this will reset the search timer)
                stopMonitoring();
                startMonitoring();
                saveSettings();
                updateUI();
            }
        });
    }

    // Load settings into UI
    function loadUIFromSettings() {
        // Load join mode
        const autojoinRadio = document.getElementById('join-mode-autojoin');
        const notifyRadio = document.getElementById('join-mode-notify');
        if (autojoinRadio && notifyRadio) {
            if (joinMode === 'notify') {
                notifyRadio.checked = true;
            } else {
                autojoinRadio.checked = true;
            }
        }

        // Load criteria into UI
        let teamCheckboxChecked = false;
        let teamMinPlayers = null;
        let teamMaxPlayers = null;

        for (const criteria of criteriaList) {
            if (criteria.gameMode === 'FFA') {
                const ffaCheckbox = document.getElementById('autojoin-ffa');
                if (ffaCheckbox) {
                    ffaCheckbox.checked = true;
                    const ffaConfig = document.getElementById('ffa-config');
                    if (ffaConfig) ffaConfig.style.display = 'block';

                    if (criteria.minPlayers) {
                        const minInput = document.getElementById('autojoin-ffa-min');
                        if (minInput) minInput.value = criteria.minPlayers;
                    }
                    if (criteria.maxPlayers) {
                        const maxInput = document.getElementById('autojoin-ffa-max');
                        if (maxInput) maxInput.value = criteria.maxPlayers;
                    }
                    // Initialize FFA slider from loaded values
                    initializeSlider('autojoin-ffa-min-slider', 'autojoin-ffa-max-slider', 'autojoin-ffa-min', 'autojoin-ffa-max', 'ffa-range-fill', 'ffa-min-value', 'ffa-max-value');
                }
            } else if (criteria.gameMode === 'Team') {
                // Mark team checkbox as checked (only once)
                if (!teamCheckboxChecked) {
                    const teamCheckbox = document.getElementById('autojoin-team');
                    if (teamCheckbox) {
                        teamCheckbox.checked = true;
                        teamCheckboxChecked = true;
                        const teamConfig = document.getElementById('team-config');
                        if (teamConfig) teamConfig.style.display = 'block';
                    }
                }

                // Store min/max players (they should be the same for all Team criteria)
                if (criteria.minPlayers !== null && criteria.minPlayers !== undefined) {
                    teamMinPlayers = criteria.minPlayers;
                }
                if (criteria.maxPlayers !== null && criteria.maxPlayers !== undefined) {
                    teamMaxPlayers = criteria.maxPlayers;
                }

                // Set team count checkbox (can have multiple)
                if (criteria.teamCount !== null && criteria.teamCount !== undefined) {
                    if (criteria.teamCount === 'Duos') {
                        const checkbox = document.getElementById('autojoin-team-duos');
                        if (checkbox) checkbox.checked = true;
                    } else if (criteria.teamCount === 'Trios') {
                        const checkbox = document.getElementById('autojoin-team-trios');
                        if (checkbox) checkbox.checked = true;
                    } else if (criteria.teamCount === 'Quads') {
                        const checkbox = document.getElementById('autojoin-team-quads');
                        if (checkbox) checkbox.checked = true;
                    } else if (criteria.teamCount === 'Humans Vs Nations') {
                        // Humans Vs Nations removed from UI, but code kept for potential reactivation
                        const checkbox = document.getElementById('autojoin-team-hvn');
                        if (checkbox) checkbox.checked = true;
                    } else if (typeof criteria.teamCount === 'number') {
                        const checkbox = document.getElementById(`autojoin-team-${criteria.teamCount}`);
                        if (checkbox) checkbox.checked = true;
                    }
                }
            }
        }

        // Set min/max players for Team (use the last values found, they should be consistent)
        if (teamCheckboxChecked) {
            if (teamMinPlayers !== null) {
                const minInput = document.getElementById('autojoin-team-min');
                if (minInput) minInput.value = teamMinPlayers;
            }
            if (teamMaxPlayers !== null) {
                const maxInput = document.getElementById('autojoin-team-max');
                if (maxInput) maxInput.value = teamMaxPlayers;
            }
            // Initialize Team slider from loaded values
            initializeSlider('autojoin-team-min-slider', 'autojoin-team-max-slider', 'autojoin-team-min', 'autojoin-team-max', 'team-range-fill', 'team-min-value', 'team-max-value');
            
            // Update warning visibility after loading settings
            setTimeout(() => {
                const warningElement = document.getElementById('team-player-filter-warning');
                if (warningElement) {
                    const duosCheckbox = document.getElementById('autojoin-team-duos');
                    const triosCheckbox = document.getElementById('autojoin-team-trios');
                    const quadsCheckbox = document.getElementById('autojoin-team-quads');
                    const hasSpecialMode = (duosCheckbox && duosCheckbox.checked) ||
                                           (triosCheckbox && triosCheckbox.checked) ||
                                           (quadsCheckbox && quadsCheckbox.checked);
                    warningElement.style.display = hasSpecialMode ? 'flex' : 'none';
                }
            }, 0);
        }
    }

    // Add CSS styles
    GM_addStyle(`
        .autojoin-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 460px;
            max-height: 90vh;
            overflow-y: auto;
            background: rgba(25, 25, 30, 0.85);
            border: 1px solid rgba(59, 130, 246, 0.4);
            border-radius: 8px;
            padding: 0;
            z-index: 10000;
            color: rgba(255, 255, 255, 0.9);
            font-family: sans-serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .autojoin-panel.hidden {
            display: none;
        }

        .autojoin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(59, 130, 246, 0.3);
            padding: 8px 12px 6px 12px;
            cursor: grab;
            user-select: none;
        }

        .autojoin-header:active {
            cursor: grabbing;
        }

        .autojoin-content {
            padding: 0 12px 10px 12px;
        }

        .autojoin-header h3 {
            margin: 0;
            font-size: 1.05em;
            color: rgba(255, 255, 255, 0.95);
        }

        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
            cursor: pointer;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ef4444;
            transition: 0.3s;
            border-radius: 26px;
        }

        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
            background-color: #10b981;
        }

        .toggle-switch input:checked + .toggle-slider:before {
            transform: translateX(24px);
        }

        .toggle-switch:hover .toggle-slider {
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .autojoin-mode-section {
            margin-bottom: 8px;
            padding: 6px;
            background: rgba(59, 130, 246, 0.08);
            border-radius: 4px;
        }

        .mode-checkbox-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: bold;
            cursor: pointer;
            margin-bottom: 6px;
            font-size: 0.95em;
            color: rgba(255, 255, 255, 0.95);
        }

        .mode-checkbox-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        .autojoin-mode-config {
            margin-left: 26px;
            margin-top: 6px;
            padding: 6px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }

        .player-filter-warning {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            margin-bottom: 8px;
            padding: 6px;
            background: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 4px;
        }

        .warning-icon {
            font-size: 1.2em;
            flex-shrink: 0;
            line-height: 1.2;
        }

        .warning-text {
            flex: 1;
            color: rgba(251, 191, 36, 0.85);
            font-size: 0.9em;
            line-height: 1.3;
        }

        .warning-text strong {
            color: rgba(251, 191, 36, 0.9);
            font-weight: 600;
        }

        .player-filter-info {
            margin-bottom: 6px;
            padding: 3px 0;
        }

        .player-filter-info small {
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.9em;
        }

        .capacity-range-wrapper {
            margin-top: 6px;
        }

        .capacity-range-visual {
            position: relative;
            padding: 12px 0 6px 0;
        }

        .capacity-track {
            position: relative;
            height: 6px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 3px;
            margin-bottom: 8px;
        }

        .capacity-range-fill {
            position: absolute;
            height: 100%;
            background: rgba(59, 130, 246, 0.5);
            border-radius: 3px;
            pointer-events: none;
            opacity: 0.7;
            transition: left 0.1s ease, width 0.1s ease;
        }

        .capacity-slider {
            position: absolute;
            width: 100%;
            height: 6px;
            top: 0;
            left: 0;
            background: transparent;
            outline: none;
            -webkit-appearance: none;
            pointer-events: none;
            margin: 0;
        }

        .capacity-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.8);
            cursor: pointer;
            pointer-events: all;
            border: 2px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            transition: transform 0.1s ease;
        }

        .capacity-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            background: rgba(96, 165, 250, 0.9);
        }

        .capacity-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.8);
            cursor: pointer;
            pointer-events: all;
            border: 2px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            transition: transform 0.1s ease;
        }

        .capacity-slider::-moz-range-thumb:hover {
            transform: scale(1.1);
            background: rgba(96, 165, 250, 0.9);
        }

        .capacity-slider-min {
            z-index: 2;
        }

        .capacity-slider-max {
            z-index: 1;
        }

        .capacity-labels {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 6px;
        }

        .capacity-label-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
        }

        .capacity-label-group label {
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.8);
            font-weight: normal;
            margin: 0;
        }

        .capacity-value {
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;
            min-width: 40px;
            text-align: center;
        }

        .capacity-inputs-hidden {
            display: none;
        }

        .player-range {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .player-range label {
            flex: 0 0 auto;
            min-width: 70px;
        }

        .player-range input.player-input {
            flex: 0 0 auto;
            width: 80px;
            padding: 5px;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 0.9em;
        }

        .player-range input.player-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.85em;
        }

        .player-hint {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.85em;
            flex: 0 0 auto;
        }

        /* Fallback for number inputs without class */
        .player-range input[type="number"]:not(.player-input) {
            flex: 1;
            max-width: 80px;
            padding: 5px;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
        }

        .team-count-section {
            margin-bottom: 6px;
        }

        .team-count-options {
            display: flex;
            flex-direction: column;
            gap: 3px;
            margin-top: 3px;
        }

        .team-count-options label {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.9);
        }

        .autojoin-status {
            margin: 8px 0;
            padding: 6px;
            background: rgba(59, 130, 246, 0.15);
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .status-label {
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9em;
        }

        .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.8);
        }

        .status-indicator.active {
            background: rgba(16, 185, 129, 0.8);
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .search-timer {
            margin-left: auto;
            font-size: 0.9em;
            color: rgba(147, 197, 253, 0.9);
            font-weight: 500;
        }

        .select-all-btn {
            background: rgba(59, 130, 246, 0.2);
            color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(59, 130, 246, 0.4);
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            padding: 3px 8px;
            flex: 1;
        }

        .select-all-btn:hover {
            background: rgba(59, 130, 246, 0.35);
        }

        .autojoin-settings {
            margin: 8px 0 0 0;
            padding: 6px;
            background: rgba(59, 130, 246, 0.08);
            border-radius: 4px;
        }

        .sound-toggle-label {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.9);
        }

        .sound-toggle-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        /* Remove any extra spacing/margins that might cause gray bar */
        .autojoin-status {
            margin-bottom: 8px;
        }

        .current-game-info {
            margin: 6px 0;
            padding: 5px 8px;
            background: rgba(59, 130, 246, 0.12);
            border-radius: 4px;
            font-size: 0.9em;
            color: rgba(147, 197, 253, 0.9);
            text-align: center;
            border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .current-game-info.not-applicable {
            background: rgba(100, 100, 100, 0.1);
            color: rgba(255, 255, 255, 0.5);
            border-color: rgba(100, 100, 100, 0.2);
            font-style: italic;
        }

        .join-mode-selector {
            display: flex;
            gap: 12px;
            margin-bottom: 8px;
            padding: 6px;
            background: rgba(59, 130, 246, 0.08);
            border-radius: 4px;
            justify-content: center;
        }

        .mode-radio-label {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.9);
            user-select: none;
        }

        .mode-radio-label input[type="radio"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: #3b82f6;
        }

        .game-found-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: 3px solid #60a5fa;
            border-radius: 8px;
            padding: 20px 30px;
            z-index: 20000;
            color: white;
            font-family: sans-serif;
            font-size: 1.1em;
            font-weight: 600;
            text-align: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.5);
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0;
            min-width: 300px;
            max-width: 500px;
            animation: notificationPulse 2s infinite;
        }

        .game-found-notification.notification-visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .game-found-notification.notification-dismissing {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }

        @keyframes notificationPulse {
            0%, 100% {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(59, 130, 246, 0.7);
            }
            50% {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 8px rgba(59, 130, 246, 0);
            }
        }

        .game-found-notification:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            border-color: #93c5fd;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 25px rgba(59, 130, 246, 0.7);
        }
    `);

    // Update panel visibility based on game state (URL-based detection)
    function updatePanelVisibility() {
        const panel = document.getElementById('openfront-autojoin-panel');
        if (!panel) return;

        const isLobby = isOnLobbyPage();
        const wasInGame = panel.dataset.wasInGame === 'true';

        if (!isLobby) {
            // In game → hide panel
            panel.classList.add('hidden');
            stopGameInfoUpdates(); // Stop updating game info when not in lobby
            // Dismiss notification when game starts
            dismissNotification();
            // If we just entered a game, disable auto-join and play bell sound
            if (!wasInGame) {
                // Play boxing ring bell sound when game starts
                playGameStartSound();
                if (autoJoinEnabled) {
                    console.log('[Auto-Join] Game started, disabling auto-join');
                    autoJoinEnabled = false;
                    stopMonitoring();
                    saveSettings();
                    updateUI();
                }
            }
            panel.dataset.wasInGame = 'true';
        } else {
            // In lobby → show panel and clear joined lobbies
            panel.classList.remove('hidden');
            startGameInfoUpdates(); // Start updating game info when in lobby
            joinedLobbies.clear(); // Clear to allow rejoining same lobby if needed

            // If we just returned to lobby, disable auto-join
            if (wasInGame && autoJoinEnabled) {
                console.log('[Auto-Join] Returned to lobby, disabling auto-join');
                autoJoinEnabled = false;
                stopMonitoring();
                saveSettings();
                updateUI();
            }
            // Clear notified lobbies when returning to lobby
            notifiedLobbies.clear();
            lastNotifiedGameID = null;
            gameFoundTime = null;
            panel.dataset.wasInGame = 'false';
        }
    }

    // Observe URL changes to update panel visibility (event-based approach)
    function observeURL() {
        // Use popstate for browser navigation (back/forward buttons)
        window.addEventListener('popstate', updatePanelVisibility);

        // Use hashchange for hash changes
        window.addEventListener('hashchange', updatePanelVisibility);

        // Use pushstate/replacestate interception for programmatic navigation
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function(...args) {
            originalPushState.apply(history, args);
            setTimeout(updatePanelVisibility, 0);
        };

        history.replaceState = function(...args) {
            originalReplaceState.apply(history, args);
            setTimeout(updatePanelVisibility, 0);
        };

        // Initial check
        updatePanelVisibility();
    }

    // Initialize
    function init() {
        console.log('[Auto-Join] Initializing...');
        loadSettings();
        console.log('[Auto-Join] Settings loaded:', { autoJoinEnabled, criteriaList });
        createUI();
        console.log('[Auto-Join] UI created');

        // Preload audio files
        preloadSounds();

        // Always start with auto-join OFF (even if it was saved as enabled)
        autoJoinEnabled = false;
        saveSettings();
        updateUI();

        // Monitor URL changes to show/hide panel (event-based, more efficient)
        observeURL();
    }

    // Start when DOM is ready (immediate check like lobby_player_list.js)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Initialize immediately (no delay needed with URL-based detection)
        init();
    }

})();
