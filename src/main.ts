/**
 * OpenFront.io Lobby Intel + Discovery
 *
 * Main entry point for the userscript.
 * This file bootstraps all modules and wires up the application.
 */

import { getStyles } from '@/styles/styles';
import { SoundUtils } from '@/utils/SoundUtils';
import { URLObserver } from '@/utils/URLObserver';
import { LobbyDataManager } from '@/data/LobbyDataManager';
import { ClanLeaderboardCache } from '@/data/ClanLeaderboardCache';
import { PlayerListUI } from '@/modules/player-list/PlayerListUI';
import { LobbyDiscoveryUI } from '@/modules/lobby-discovery/LobbyDiscoveryUI';
import { STORAGE_KEYS } from '@/config/constants';
import type { PanelSize } from '@/types/game';

/**
 * Inject flexbox layout wrapper for anchored player list panel
 */
function injectLayoutWrapper(): void {
  // Wait for body to be available
  if (!document.body) {
    console.warn('[OpenFront Bundle] Body not ready, retrying layout wrapper injection...');
    setTimeout(injectLayoutWrapper, 100);
    return;
  }

  // Check if wrapper already exists
  if (document.getElementById('of-game-layout-wrapper')) {
    console.log('[OpenFront Bundle] Layout wrapper already exists');
    return;
  }

  const body = document.body;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.id = 'of-game-layout-wrapper';

  // Create content container
  const content = document.createElement('div');
  content.id = 'of-game-content';

  // Move all existing body children into content
  while (body.firstChild) {
    content.appendChild(body.firstChild);
  }

  // Assemble layout
  wrapper.appendChild(content);
  body.appendChild(wrapper);

  // Initialize CSS variable (will be updated by ResizeHandler)
  const savedWidth = GM_getValue<PanelSize | undefined>(STORAGE_KEYS.playerListPanelSize);
  const initialWidth = savedWidth?.width || 300;
  document.documentElement.style.setProperty('--player-list-width', initialWidth + 'px');

  console.log('[OpenFront Bundle] Layout wrapper injected ✅');
}

(function () {
  'use strict';

  console.log('[OpenFront Bundle] Initializing v2.3.0...');

  // Inject CSS styles
  GM_addStyle(getStyles());
  console.log('[OpenFront Bundle] Styles injected ✅');

  // Inject layout wrapper for flexbox layout
  injectLayoutWrapper();

  // Initialize sound system
  SoundUtils.preloadSounds();
  console.log('[OpenFront Bundle] Sound system initialized ✅');

  // Initialize URL observer
  URLObserver.init();
  console.log('[OpenFront Bundle] URL observer initialized ✅');

  // Start lobby data manager (WebSocket with HTTP fallback)
  LobbyDataManager.start();
  console.log('[OpenFront Bundle] Lobby data manager started ✅');

  // Preload clan leaderboard data
  ClanLeaderboardCache.fetch();
  console.log('[OpenFront Bundle] Clan leaderboard caching started ✅');

  // Initialize PlayerList module
  const playerList = new PlayerListUI();
  console.log('[OpenFront Bundle] Player list initialized ✅');

  // Initialize lobby discovery module
  const lobbyDiscovery = new LobbyDiscoveryUI();
  console.log('[OpenFront Bundle] Lobby discovery initialized ✅');

  // Wire up LobbyDataManager to both modules
  LobbyDataManager.subscribe((lobbies) => {
    playerList.receiveLobbyUpdate(lobbies);
    lobbyDiscovery.receiveLobbyUpdate(lobbies);
  });
  console.log('[OpenFront Bundle] Modules subscribed to lobby updates ✅');

  console.log('[OpenFront Bundle] Ready! 🚀');

})();
