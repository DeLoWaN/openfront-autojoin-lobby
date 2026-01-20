/**
 * AutoJoinUI - Main UI class for the auto-join feature
 *
 * Responsibilities:
 * - Render auto-join panel with criteria configuration
 * - Process lobby updates and trigger joining
 * - Show notifications when games are found
 * - Manage search timers and current game info
 * - Handle auto-join vs notify modes
 */

import { STORAGE_KEYS } from '@/config/constants';
import { DragHandler } from '@/utils/DragHandler';
import { LobbyUtils } from '@/utils/LobbyUtils';
import { SoundUtils } from '@/utils/SoundUtils';
import { URLObserver } from '@/utils/URLObserver';
import type { Lobby } from '@/types/game';
import type { AutoJoinSettings, AutoJoinCriteria, JoinMode, TeamCount } from './AutoJoinTypes';
import { AutoJoinEngine } from './AutoJoinEngine';
import { getGameDetailsText } from './AutoJoinHelpers';

export class AutoJoinUI {
  // State
  private autoJoinEnabled: boolean = true;
  private criteriaList: AutoJoinCriteria[] = [];
  private joinedLobbies: Set<string> = new Set();
  private searchStartTime: number | null = null;
  private gameFoundTime: number | null = null;
  private isJoining: boolean = false;
  private soundEnabled: boolean = true;
  private recentlyLeftLobbyID: string | null = null;
  private joinMode: JoinMode = 'autojoin';
  private notifiedLobbies: Set<string> = new Set();
  private lastNotifiedGameID: string | null = null;
  private isTeamThreeTimesMinEnabled: boolean = false;
  private sleeping: boolean = false;

  // Intervals/timers
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private gameInfoInterval: ReturnType<typeof setInterval> | null = null;
  private notificationTimeout: ReturnType<typeof setTimeout> | null = null;

  // DOM elements
  private panel!: HTMLDivElement;
  private dragHandler!: DragHandler;

  // Engine
  private engine: AutoJoinEngine;

  constructor() {
    this.engine = new AutoJoinEngine();
    this.loadSettings();
    this.createUI();
    this.updateSleepState();
    URLObserver.subscribe(() => this.updateSleepState());
  }

  /**
   * Receive lobby update from LobbyDataManager
   */
  receiveLobbyUpdate(lobbies: Lobby[]): void {
    this.processLobbies(lobbies);
  }

  /**
   * Migrate old settings to new storage keys
   */
  private migrateSettings(): void {
    const oldKey = 'autoJoinSettings';
    const newKey = STORAGE_KEYS.autoJoinSettings;
    const oldPosKey = 'autoJoinPanelPosition';
    const newPosKey = STORAGE_KEYS.autoJoinPanelPosition;

    const oldSettings = GM_getValue(oldKey);
    const newSettings = GM_getValue(newKey);
    if (oldSettings && !newSettings) {
      GM_setValue(newKey, oldSettings);
    }

    const oldPos = GM_getValue(oldPosKey);
    const newPos = GM_getValue(newPosKey);
    if (oldPos && !newPos) {
      GM_setValue(newPosKey, oldPos);
    }
  }

  /**
   * Load settings from GM_storage
   */
  private loadSettings(): void {
    this.migrateSettings();
    const saved = GM_getValue<AutoJoinSettings | null>(STORAGE_KEYS.autoJoinSettings, null);
    if (saved) {
      this.criteriaList = saved.criteria || [];
      this.soundEnabled = saved.soundEnabled !== undefined ? saved.soundEnabled : true;
      this.joinMode = saved.joinMode || 'autojoin';
      this.isTeamThreeTimesMinEnabled = saved.isTeamThreeTimesMinEnabled || false;
      this.autoJoinEnabled = saved.autoJoinEnabled !== undefined ? saved.autoJoinEnabled : true;
    }
  }

  /**
   * Save settings to GM_storage
   */
  private saveSettings(): void {
    GM_setValue(STORAGE_KEYS.autoJoinSettings, {
      criteria: this.criteriaList,
      autoJoinEnabled: this.autoJoinEnabled,
      soundEnabled: this.soundEnabled,
      joinMode: this.joinMode,
      isTeamThreeTimesMinEnabled: this.isTeamThreeTimesMinEnabled,
    });
  }

  /**
   * Update search timer display
   */
  private updateSearchTimer(): void {
    const timerElement = document.getElementById('search-timer');
    if (!timerElement) return;

    if (
      !this.autoJoinEnabled ||
      this.searchStartTime === null ||
      !this.criteriaList ||
      this.criteriaList.length === 0
    ) {
      timerElement.style.display = 'none';
      this.gameFoundTime = null;
      return;
    }

    if (this.gameFoundTime !== null) {
      const elapsed = Math.floor((this.gameFoundTime - this.searchStartTime) / 1000);
      timerElement.textContent = `Game found! (${Math.floor(elapsed / 60)}m ${elapsed % 60}s)`;
      timerElement.style.display = 'inline';
      return;
    }

    const elapsed = Math.floor((Date.now() - this.searchStartTime) / 1000);
    timerElement.textContent = `Searching: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
    timerElement.style.display = 'inline';
  }

  /**
   * Update current game info display
   */
  private updateCurrentGameInfo(): void {
    const gameInfoElement = document.getElementById('current-game-info');
    if (!gameInfoElement || !LobbyUtils.isOnLobbyPage()) {
      if (gameInfoElement) {
        gameInfoElement.style.display = 'none';
      }
      return;
    }

    gameInfoElement.style.display = 'block';

    const publicLobby = document.querySelector('public-lobby') as any;
    if (!publicLobby || !publicLobby.lobbies || publicLobby.lobbies.length === 0) {
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

    const gameDetails = getGameDetailsText(currentLobby);
    gameInfoElement.textContent = `Current game: ${gameDetails}`;
    gameInfoElement.classList.remove('not-applicable');
  }

  /**
   * Process lobbies - main auto-join logic
   */
  private processLobbies(lobbies: Lobby[]): void {
    try {
      this.updateCurrentGameInfo();

      if (this.isJoining || !this.autoJoinEnabled) {
        return;
      }

      if (!this.criteriaList || this.criteriaList.length === 0) {
        return;
      }

      if (!LobbyUtils.isOnLobbyPage()) {
        return;
      }

      // Handle notify mode - reset if game changed
      if (
        this.joinMode === 'notify' &&
        this.gameFoundTime !== null &&
        this.lastNotifiedGameID !== null
      ) {
        const currentLobby = lobbies.length > 0 ? lobbies[0] : null;
        if (currentLobby?.gameID !== this.lastNotifiedGameID) {
          this.gameFoundTime = null;
          this.lastNotifiedGameID = null;
          this.syncSearchTimer({ resetStart: true });
        }
      }

      // Check each lobby for matches
      for (const lobby of lobbies) {
        if (this.engine.matchesCriteria(lobby, this.criteriaList)) {
          if (this.recentlyLeftLobbyID === lobby.gameID) {
            continue; // Skip recently left lobby
          }

          if (this.joinMode === 'notify') {
            // Notify mode - show notification
            if (!this.notifiedLobbies.has(lobby.gameID)) {
              this.showGameFoundNotification(lobby);
              console.log('[AutoJoin] Sound enabled:', this.soundEnabled);
              if (this.soundEnabled) {
                SoundUtils.playGameFoundSound();
              }
              this.notifiedLobbies.add(lobby.gameID);
              this.gameFoundTime = Date.now();
              this.lastNotifiedGameID = lobby.gameID;
            }
            return;
          } else {
            // Auto-join mode - join automatically
            if (!this.joinedLobbies.has(lobby.gameID)) {
              this.joinLobby(lobby);
              this.joinedLobbies.add(lobby.gameID);
            }
            return;
          }
        }
      }
    } catch (error) {
      console.error('[AutoJoin] Error processing lobbies:', error);
    }
  }

  /**
   * Show game found notification
   */
  private showGameFoundNotification(lobby: Lobby): void {
    this.dismissNotification();

    const notification = this.createNewNotification(lobby);
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('notification-visible');
    });

    this.notificationTimeout = setTimeout(() => {
      this.dismissNotification(notification);
    }, 10000);
  }

  /**
   * Create new notification element
   */
  private createNewNotification(lobby: Lobby): HTMLElement {
    const notification = document.createElement('div');
    notification.className = 'game-found-notification';

    const gameDetails = getGameDetailsText(lobby);
    notification.innerHTML = `
      <div>🎮 Game Found!</div>
      <div style="font-size: 0.9em; margin-top: 8px;">${gameDetails}</div>
      <div style="font-size: 0.8em; margin-top: 4px; opacity: 0.8;">Click to dismiss</div>
    `;

    notification.addEventListener('click', () => {
      this.dismissNotification(notification);
    });

    return notification;
  }

  /**
   * Dismiss notification
   */
  private dismissNotification(targetElement: HTMLElement | null = null): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }

    const notifications = targetElement
      ? [targetElement]
      : Array.from(document.querySelectorAll('.game-found-notification'));

    for (const notification of notifications) {
      notification.classList.remove('notification-visible');
      notification.classList.add('notification-dismissing');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  /**
   * Join a lobby
   */
  private joinLobby(lobby: Lobby): void {
    if (this.isJoining) return;

    console.log('[AutoJoin] Attempting to join lobby:', lobby.gameID);
    this.isJoining = true;
    this.gameFoundTime = Date.now();

    const tryJoin = () => {
      const success = LobbyUtils.tryJoinLobby();
      if (success) {
        console.log('[AutoJoin] Join initiated');
        if (this.soundEnabled) {
          SoundUtils.playGameStartSound();
        }
        this.recentlyLeftLobbyID = lobby.gameID;
        setTimeout(() => {
          this.recentlyLeftLobbyID = null;
        }, 5000);
      } else {
        console.warn('[AutoJoin] Failed to join lobby');
      }
      this.isJoining = false;
    };

    setTimeout(tryJoin, 100);
  }

  /**
   * Stop timer
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Start game info updates
   */
  private startGameInfoUpdates(): void {
    this.stopGameInfoUpdates();
    this.updateCurrentGameInfo();
    this.gameInfoInterval = setInterval(() => this.updateCurrentGameInfo(), 1000);
  }

  /**
   * Stop game info updates
   */
  private stopGameInfoUpdates(): void {
    if (this.gameInfoInterval) {
      clearInterval(this.gameInfoInterval);
      this.gameInfoInterval = null;
    }
  }

  /**
   * Sync search timer
   */
  private syncSearchTimer(options: { resetStart?: boolean } = {}): void {
    const { resetStart = false } = options;

    this.stopTimer();

    if (resetStart) {
      this.searchStartTime = null;
      this.gameFoundTime = null;
      this.notifiedLobbies.clear();
      this.lastNotifiedGameID = null;
    }

    if (this.autoJoinEnabled && this.criteriaList && this.criteriaList.length > 0) {
      if (this.searchStartTime === null) {
        this.searchStartTime = Date.now();
      }
      this.timerInterval = setInterval(() => this.updateSearchTimer(), 100);
    } else {
      this.searchStartTime = null;
      this.gameFoundTime = null;
    }

    this.updateSearchTimer();
  }

  /**
   * Set auto-join enabled state
   */
  private setAutoJoinEnabled(enabled: boolean, options: { resetTimer?: boolean } = {}): void {
    const { resetTimer = false } = options;
    this.autoJoinEnabled = enabled;
    this.saveSettings();
    this.updateUI();
    this.syncSearchTimer({ resetStart: resetTimer });
  }

  /**
   * Get number value from input
   */
  private getNumberValue(id: string): number | null {
    const input = document.getElementById(id) as HTMLInputElement;
    if (!input) return null;
    const val = parseInt(input.value, 10);
    return isNaN(val) ? null : val;
  }

  /**
   * Get all team count checkbox values
   */
  private getAllTeamCountValues(): TeamCount[] {
    const values: TeamCount[] = [];
    const ids = [
      'autojoin-team-duos',
      'autojoin-team-trios',
      'autojoin-team-quads',
      'autojoin-team-2',
      'autojoin-team-3',
      'autojoin-team-4',
      'autojoin-team-5',
      'autojoin-team-6',
      'autojoin-team-7',
    ];

    for (const id of ids) {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      if (checkbox?.checked) {
        const value = checkbox.value;
        if (value === 'Duos' || value === 'Trios' || value === 'Quads') {
          values.push(value);
        } else {
          const num = parseInt(value, 10);
          if (!isNaN(num)) values.push(num);
        }
      }
    }

    return values;
  }

  /**
   * Set all team count checkboxes
   */
  private setAllTeamCounts(checked: boolean): void {
    const ids = [
      'autojoin-team-duos',
      'autojoin-team-trios',
      'autojoin-team-quads',
      'autojoin-team-2',
      'autojoin-team-3',
      'autojoin-team-4',
      'autojoin-team-5',
      'autojoin-team-6',
      'autojoin-team-7',
    ];

    for (const id of ids) {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      if (checkbox) checkbox.checked = checked;
    }
  }

  /**
   * Build criteria list from UI state
   */
  private buildCriteriaFromUI(): AutoJoinCriteria[] {
    const criteria: AutoJoinCriteria[] = [];

    const ffaCheckbox = document.getElementById('autojoin-ffa') as HTMLInputElement;
    if (ffaCheckbox?.checked) {
      criteria.push({
        gameMode: 'FFA',
        minPlayers: this.getNumberValue('autojoin-ffa-min'),
        maxPlayers: this.getNumberValue('autojoin-ffa-max'),
      });
    }

    const teamCheckbox = document.getElementById('autojoin-team') as HTMLInputElement;
    if (teamCheckbox?.checked) {
      const teamCounts = this.getAllTeamCountValues();

      if (teamCounts.length === 0) {
        // No specific team counts - accept any
        criteria.push({
          gameMode: 'Team',
          teamCount: null,
          minPlayers: this.getNumberValue('autojoin-team-min'),
          maxPlayers: this.getNumberValue('autojoin-team-max'),
        });
      } else {
        // Add criteria for each selected team count
        for (const teamCount of teamCounts) {
          criteria.push({
            gameMode: 'Team',
            teamCount,
            minPlayers: this.getNumberValue('autojoin-team-min'),
            maxPlayers: this.getNumberValue('autojoin-team-max'),
          });
        }
      }
    }

    return criteria;
  }

  /**
   * Update UI based on current state
   */
  private updateUI(): void {
    const button = document.getElementById('autojoin-main-button');
    const statusText = document.querySelector('.status-text') as HTMLElement;
    const statusIndicator = document.querySelector('.status-indicator') as HTMLElement;

    if (button) {
      if (this.joinMode === 'autojoin') {
        button.textContent = 'Auto-Join';
        button.classList.add('active');
        button.classList.remove('inactive');
      } else {
        button.textContent = 'Notify Only';
        button.classList.remove('active');
        button.classList.add('inactive');
      }
    }

    if (statusText && statusIndicator) {
      if (this.autoJoinEnabled) {
        statusText.textContent = 'Active';
        statusIndicator.style.background = '#5fd785';
      } else {
        statusText.textContent = 'Inactive';
        statusIndicator.style.background = '#888';
      }
    }
  }

  /**
   * Load UI from saved settings
   */
  private loadUIFromSettings(): void {
    // Load FFA checkbox
    const ffaCheckbox = document.getElementById('autojoin-ffa') as HTMLInputElement;
    const ffaConfig = document.getElementById('ffa-config');
    const hasFFA = this.criteriaList.some((c) => c.gameMode === 'FFA');
    if (ffaCheckbox) {
      ffaCheckbox.checked = hasFFA;
      if (ffaConfig) {
        ffaConfig.style.display = hasFFA ? 'block' : 'none';
      }
    }

    // Load Team checkbox
    const teamCheckbox = document.getElementById('autojoin-team') as HTMLInputElement;
    const teamConfig = document.getElementById('team-config');
    const hasTeam = this.criteriaList.some((c) => c.gameMode === 'Team');
    if (teamCheckbox) {
      teamCheckbox.checked = hasTeam;
      if (teamConfig) {
        teamConfig.style.display = hasTeam ? 'block' : 'none';
      }
    }

    // Load team count selections
    const teamCriteria = this.criteriaList.filter((c) => c.gameMode === 'Team');
    const teamCounts = teamCriteria.map((c) => c.teamCount).filter((tc) => tc !== null);

    for (const teamCount of teamCounts) {
      let checkbox: HTMLInputElement | null = null;
      if (teamCount === 'Duos') checkbox = document.getElementById('autojoin-team-duos') as HTMLInputElement;
      else if (teamCount === 'Trios') checkbox = document.getElementById('autojoin-team-trios') as HTMLInputElement;
      else if (teamCount === 'Quads') checkbox = document.getElementById('autojoin-team-quads') as HTMLInputElement;
      else if (typeof teamCount === 'number') {
        checkbox = document.getElementById(`autojoin-team-${teamCount}`) as HTMLInputElement;
      }
      if (checkbox) checkbox.checked = true;
    }

    // Load capacity values
    const ffaCrit = this.criteriaList.find((c) => c.gameMode === 'FFA');
    if (ffaCrit) {
      const ffaMinInput = document.getElementById('autojoin-ffa-min') as HTMLInputElement;
      const ffaMaxInput = document.getElementById('autojoin-ffa-max') as HTMLInputElement;
      if (ffaMinInput && ffaCrit.minPlayers !== null) ffaMinInput.value = String(ffaCrit.minPlayers);
      if (ffaMaxInput && ffaCrit.maxPlayers !== null) ffaMaxInput.value = String(ffaCrit.maxPlayers);
    }

    const teamCrit = teamCriteria[0];
    if (teamCrit) {
      const teamMinInput = document.getElementById('autojoin-team-min') as HTMLInputElement;
      const teamMaxInput = document.getElementById('autojoin-team-max') as HTMLInputElement;
      if (teamMinInput && teamCrit.minPlayers !== null) teamMinInput.value = String(teamCrit.minPlayers);
      if (teamMaxInput && teamCrit.maxPlayers !== null) teamMaxInput.value = String(teamCrit.maxPlayers);
    }

    // Load sound checkbox
    const soundCheckbox = document.getElementById('autojoin-sound-toggle') as HTMLInputElement;
    if (soundCheckbox) soundCheckbox.checked = this.soundEnabled;
  }

  /**
   * Initialize slider (dual range slider)
   */
  private initializeSlider(
    minSliderId: string,
    maxSliderId: string,
    minInputId: string,
    maxInputId: string,
    fillId: string,
    minValueId: string,
    maxValueId: string
  ): void {
    const minSlider = document.getElementById(minSliderId) as HTMLInputElement;
    const maxSlider = document.getElementById(maxSliderId) as HTMLInputElement;
    const minInput = document.getElementById(minInputId) as HTMLInputElement;
    const maxInput = document.getElementById(maxInputId) as HTMLInputElement;

    if (!minSlider || !maxSlider || !minInput || !maxInput) return;

    const update = () => {
      this.updateSliderRange(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId);
      this.criteriaList = this.buildCriteriaFromUI();
      this.saveSettings();
      this.syncSearchTimer({ resetStart: true });
    };

    minSlider.addEventListener('input', update);
    maxSlider.addEventListener('input', update);

    // Initial update
    this.updateSliderRange(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId);
  }

  /**
   * Update slider range visual and values
   */
  private updateSliderRange(
    minSliderId: string,
    maxSliderId: string,
    minInputId: string,
    maxInputId: string,
    fillId: string,
    minValueId: string,
    maxValueId: string
  ): void {
    const minSlider = document.getElementById(minSliderId) as HTMLInputElement;
    const maxSlider = document.getElementById(maxSliderId) as HTMLInputElement;
    const minInput = document.getElementById(minInputId) as HTMLInputElement;
    const maxInput = document.getElementById(maxInputId) as HTMLInputElement;
    const fill = document.getElementById(fillId);
    const minValueSpan = document.getElementById(minValueId);
    const maxValueSpan = document.getElementById(maxValueId);

    if (!minSlider || !maxSlider || !minInput || !maxInput) return;

    let minVal = parseInt(minSlider.value, 10);
    let maxVal = parseInt(maxSlider.value, 10);

    // Handle 3× constraint for team mode
    if (minSliderId.includes('team') && this.isTeamThreeTimesMinEnabled) {
      maxVal = Math.min(parseInt(maxSlider.max, 10), Math.max(1, 3 * minVal));
      maxSlider.value = String(maxVal);
    }

    // Ensure min <= max
    if (minVal > maxVal) {
      minVal = maxVal;
      minSlider.value = String(minVal);
    }

    minInput.value = String(minVal);
    maxInput.value = String(maxVal);

    if (minValueSpan) {
      minValueSpan.textContent = minVal === 1 ? 'Any' : String(minVal);
    }
    if (maxValueSpan) {
      maxValueSpan.textContent = maxVal === parseInt(maxSlider.max, 10) ? 'Any' : String(maxVal);
    }

    // Update fill visual
    if (fill) {
      const minPercent = ((minVal - parseInt(minSlider.min, 10)) / (parseInt(minSlider.max, 10) - parseInt(minSlider.min, 10))) * 100;
      const maxPercent = ((maxVal - parseInt(minSlider.min, 10)) / (parseInt(minSlider.max, 10) - parseInt(minSlider.min, 10))) * 100;
      fill.style.left = minPercent + '%';
      fill.style.width = maxPercent - minPercent + '%';
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Main button (toggle auto-join vs notify)
    document.getElementById('autojoin-main-button')?.addEventListener('click', () => {
      this.joinMode = this.joinMode === 'autojoin' ? 'notify' : 'autojoin';
      this.saveSettings();
      this.updateUI();
    });

    // Status toggle (enable/disable)
    document.getElementById('autojoin-status')?.addEventListener('click', () => {
      this.setAutoJoinEnabled(!this.autoJoinEnabled, { resetTimer: true });
    });

    // FFA checkbox
    const ffaCheckbox = document.getElementById('autojoin-ffa') as HTMLInputElement;
    if (ffaCheckbox) {
      ffaCheckbox.addEventListener('change', () => {
        const ffaConfig = document.getElementById('ffa-config');
        if (ffaConfig) {
          ffaConfig.style.display = ffaCheckbox.checked ? 'block' : 'none';
        }
        this.criteriaList = this.buildCriteriaFromUI();
        this.saveSettings();
        this.syncSearchTimer({ resetStart: true });
      });
    }

    // Team checkbox
    const teamCheckbox = document.getElementById('autojoin-team') as HTMLInputElement;
    if (teamCheckbox) {
      teamCheckbox.addEventListener('change', () => {
        const teamConfig = document.getElementById('team-config');
        if (teamConfig) {
          teamConfig.style.display = teamCheckbox.checked ? 'block' : 'none';
        }
        this.criteriaList = this.buildCriteriaFromUI();
        this.saveSettings();
        this.syncSearchTimer({ resetStart: true });
      });
    }

    // 3× checkbox
    const threeTimesCheckbox = document.getElementById('autojoin-team-three-times') as HTMLInputElement;
    if (threeTimesCheckbox) {
      threeTimesCheckbox.checked = this.isTeamThreeTimesMinEnabled;
      threeTimesCheckbox.addEventListener('change', () => {
        this.isTeamThreeTimesMinEnabled = threeTimesCheckbox.checked;
        this.saveSettings();
        this.updateUI();

        const minSlider = document.getElementById('autojoin-team-min-slider') as HTMLInputElement;
        const maxSlider = document.getElementById('autojoin-team-max-slider') as HTMLInputElement;
        if (minSlider && maxSlider) {
          const minVal = parseInt(minSlider.value, 10);
          maxSlider.value = this.isTeamThreeTimesMinEnabled
            ? String(Math.min(50, Math.max(1, 3 * minVal)))
            : maxSlider.value;
          this.updateSliderRange(
            'autojoin-team-min-slider',
            'autojoin-team-max-slider',
            'autojoin-team-min',
            'autojoin-team-max',
            'team-range-fill',
            'team-min-value',
            'team-max-value'
          );
        }
      });
    }

    // Select/deselect all team counts
    document.getElementById('autojoin-team-select-all')?.addEventListener('click', () => {
      this.setAllTeamCounts(true);
      this.criteriaList = this.buildCriteriaFromUI();
      this.saveSettings();
      this.syncSearchTimer({ resetStart: true });
    });

    document.getElementById('autojoin-team-deselect-all')?.addEventListener('click', () => {
      this.setAllTeamCounts(false);
      this.criteriaList = this.buildCriteriaFromUI();
      this.saveSettings();
      this.syncSearchTimer({ resetStart: true });
    });

    // Team count checkboxes
    const teamCountIds = [
      'autojoin-team-2',
      'autojoin-team-3',
      'autojoin-team-4',
      'autojoin-team-5',
      'autojoin-team-6',
      'autojoin-team-7',
      'autojoin-team-duos',
      'autojoin-team-trios',
      'autojoin-team-quads',
    ];

    for (const id of teamCountIds) {
      document.getElementById(id)?.addEventListener('change', () => {
        this.criteriaList = this.buildCriteriaFromUI();
        this.saveSettings();
        this.syncSearchTimer({ resetStart: true });
      });
    }

    // Sound toggle
    const soundToggle = document.getElementById('autojoin-sound-toggle') as HTMLInputElement;
    if (soundToggle) {
      soundToggle.addEventListener('change', () => {
        this.soundEnabled = soundToggle.checked;
        this.saveSettings();
      });
    }
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    if (document.getElementById('openfront-autojoin-panel')) {
      return;
    }

    this.panel = document.createElement('div');
    this.panel.id = 'openfront-autojoin-panel';
    this.panel.className = 'of-panel autojoin-panel';
    this.panel.innerHTML = `
      <div class="of-header autojoin-header"><span>Auto-Join</span></div>
      <div class="of-content autojoin-content">
        <button type="button" id="autojoin-main-button" class="autojoin-main-button active">Auto-Join</button>
        <div class="autojoin-mode-config">
          <label class="mode-checkbox-label"><input type="checkbox" id="autojoin-ffa" name="gameMode" value="FFA"><span>FFA</span></label>
          <div class="autojoin-mode-config" id="ffa-config" style="display: none;">
            <div class="player-filter-info"><small>Filter by max players:</small></div>
            <div class="capacity-range-wrapper">
              <div class="capacity-range-visual">
                <div class="capacity-track">
                  <div class="capacity-range-fill" id="ffa-range-fill"></div>
                  <input type="range" id="autojoin-ffa-min-slider" min="1" max="100" value="1" class="capacity-slider capacity-slider-min">
                  <input type="range" id="autojoin-ffa-max-slider" min="1" max="100" value="100" class="capacity-slider capacity-slider-max">
                </div>
                <div class="capacity-labels">
                  <div class="capacity-label-group"><label for="autojoin-ffa-min-slider">Min:</label><span class="capacity-value" id="ffa-min-value">Any</span></div>
                  <div class="capacity-label-group"><label for="autojoin-ffa-max-slider">Max:</label><span class="capacity-value" id="ffa-max-value">Any</span></div>
                </div>
              </div>
              <div class="capacity-inputs-hidden">
                <input type="number" id="autojoin-ffa-min" min="1" max="100" style="display: none;">
                <input type="number" id="autojoin-ffa-max" min="1" max="100" style="display: none;">
              </div>
            </div>
          </div>
        </div>
        <div class="autojoin-mode-config">
          <label class="mode-checkbox-label"><input type="checkbox" id="autojoin-team" name="gameMode" value="Team"><span>Team</span></label>
          <div class="autojoin-mode-config" id="team-config" style="display: none;">
            <div class="team-count-section">
              <label>Teams (optional):</label>
              <div>
                <button type="button" id="autojoin-team-select-all" class="select-all-btn">Select All</button>
                <button type="button" id="autojoin-team-deselect-all" class="select-all-btn">Deselect All</button>
              </div>
              <div class="team-count-options-centered">
                <div class="team-count-column">
                  <label><input type="checkbox" id="autojoin-team-duos" value="Duos"> Duos</label>
                  <label><input type="checkbox" id="autojoin-team-trios" value="Trios"> Trios</label>
                  <label><input type="checkbox" id="autojoin-team-quads" value="Quads"> Quads</label>
                </div>
                <div class="team-count-column">
                  <label><input type="checkbox" id="autojoin-team-2" value="2"> 2 teams</label>
                  <label><input type="checkbox" id="autojoin-team-3" value="3"> 3 teams</label>
                  <label><input type="checkbox" id="autojoin-team-4" value="4"> 4 teams</label>
                </div>
                <div class="team-count-column">
                  <label><input type="checkbox" id="autojoin-team-5" value="5"> 5 teams</label>
                  <label><input type="checkbox" id="autojoin-team-6" value="6"> 6 teams</label>
                  <label><input type="checkbox" id="autojoin-team-7" value="7"> 7 teams</label>
                </div>
              </div>
            </div>
            <div class="player-filter-info"><small>Filter by players per team:</small></div>
            <div class="capacity-range-wrapper">
              <div class="capacity-range-visual">
                <div class="capacity-track">
                  <div class="capacity-range-fill" id="team-range-fill"></div>
                  <input type="range" id="autojoin-team-min-slider" min="1" max="50" value="1" class="capacity-slider capacity-slider-min">
                  <input type="range" id="autojoin-team-max-slider" min="1" max="50" value="50" class="capacity-slider capacity-slider-max">
                </div>
                <div class="capacity-labels">
                  <div class="capacity-label-group"><label for="autojoin-team-min-slider">Min:</label><span class="capacity-value" id="team-min-value">1</span></div>
                  <div class="three-times-checkbox"><label for="autojoin-team-three-times">3×</label><input type="checkbox" id="autojoin-team-three-times"></div>
                  <div class="capacity-label-group"><label for="autojoin-team-max-slider">Max:</label><span class="capacity-value" id="team-max-value">50</span></div>
                </div>
              </div>
              <div class="capacity-inputs-hidden">
                <input type="number" id="autojoin-team-min" min="1" max="50" style="display: none;">
                <input type="number" id="autojoin-team-max" min="1" max="50" style="display: none;">
              </div>
            </div>
            <div class="current-game-info" id="current-game-info" style="display: none;"></div>
          </div>
        </div>
      </div>
      <div class="of-footer autojoin-footer">
        <div class="autojoin-status" id="autojoin-status"><span class="status-indicator"></span><span class="status-text">Active</span><span class="search-timer" id="search-timer" style="display: none;"></span></div>
        <div class="autojoin-settings"><label class="sound-toggle-label"><input type="checkbox" id="autojoin-sound-toggle"><span>🔔 Sound</span></label></div>
      </div>
    `;

    document.body.appendChild(this.panel);

    this.dragHandler = new DragHandler(
      this.panel,
      (x, y) => {
        this.panel.style.left = x + 'px';
        this.panel.style.top = y + 'px';
        this.panel.style.right = 'auto';
      },
      STORAGE_KEYS.autoJoinPanelPosition
    );

    this.setupEventListeners();
    this.loadUIFromSettings();
    this.initializeSlider(
      'autojoin-ffa-min-slider',
      'autojoin-ffa-max-slider',
      'autojoin-ffa-min',
      'autojoin-ffa-max',
      'ffa-range-fill',
      'ffa-min-value',
      'ffa-max-value'
    );
    this.initializeSlider(
      'autojoin-team-min-slider',
      'autojoin-team-max-slider',
      'autojoin-team-min',
      'autojoin-team-max',
      'team-range-fill',
      'team-min-value',
      'team-max-value'
    );
    this.updateUI();
    this.syncSearchTimer();
    this.startGameInfoUpdates();
  }

  /**
   * Update sleep state - hide when in-game
   */
  private updateSleepState(): void {
    const onLobby = LobbyUtils.isOnLobbyPage();
    this.sleeping = !onLobby;

    if (this.sleeping) {
      this.panel.classList.add('hidden');
      this.stopTimer();
      this.stopGameInfoUpdates();
    } else {
      this.panel.classList.remove('hidden');
      this.syncSearchTimer();
      this.startGameInfoUpdates();
    }
  }

  /**
   * Cleanup when removing the module
   */
  cleanup(): void {
    this.stopTimer();
    this.stopGameInfoUpdates();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.dragHandler) {
      this.dragHandler.destroy();
    }
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    this.dismissNotification();
  }
}
