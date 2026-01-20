/**
 * OpenFront.io Bundle: Player List + Auto-Join
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
import { AutoJoinUI } from '@/modules/auto-join/AutoJoinUI';

(function () {
  'use strict';

  console.log('[OpenFront Bundle] Initializing v2.2.1...');

  // Inject CSS styles
  GM_addStyle(getStyles());
  console.log('[OpenFront Bundle] Styles injected ✅');

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

  // Initialize AutoJoin module
  const autoJoin = new AutoJoinUI();
  console.log('[OpenFront Bundle] Auto-join initialized ✅');

  // Wire up LobbyDataManager to both modules
  LobbyDataManager.subscribe((lobbies) => {
    playerList.receiveLobbyUpdate(lobbies);
    autoJoin.receiveLobbyUpdate(lobbies);
  });
  console.log('[OpenFront Bundle] Modules subscribed to lobby updates ✅');

  console.log('[OpenFront Bundle] Ready! 🚀');

})();
