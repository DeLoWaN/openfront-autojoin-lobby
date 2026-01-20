/**
 * Helper functions for AutoJoin module
 * Pure functions with no side effects
 */

import type { Lobby } from '@/types/game';
import type { TeamCount } from './AutoJoinTypes';

/**
 * Calculate players per team based on team configuration and capacity
 *
 * @param playerTeams - Team configuration ('Duos', 'Trios', 'Quads', or team count)
 * @param gameCapacity - Total game capacity
 * @returns Players per team or null if cannot calculate
 */
export function getPlayersPerTeam(
  playerTeams: string | number | null | undefined,
  gameCapacity: number | null
): number | null {
  if (!playerTeams || !gameCapacity) return null;

  if (playerTeams === 'Duos') return 2;
  if (playerTeams === 'Trios') return 3;
  if (playerTeams === 'Quads') return 4;

  if (typeof playerTeams === 'number' && playerTeams > 0) {
    return Math.floor(gameCapacity / playerTeams);
  }

  return null;
}

/**
 * Normalize game mode string to 'FFA' or 'Team'
 *
 * @param mode - Raw game mode string
 * @returns Normalized game mode or null
 */
export function normalizeGameMode(mode: string | null | undefined): 'FFA' | 'Team' | null {
  if (!mode) return null;
  const lower = mode.toLowerCase().trim();

  if (lower === 'free for all' || lower === 'ffa') return 'FFA';
  if (lower === 'team' || lower === 'teams') return 'Team';

  return null;
}

/**
 * Get game mode from lobby
 *
 * @param lobby - Lobby object
 * @returns Game mode ('FFA' or 'Team') or null
 */
export function getLobbyGameMode(lobby: Lobby): 'FFA' | 'Team' | null {
  return normalizeGameMode(lobby.gameConfig?.gameMode);
}

/**
 * Get team configuration from lobby
 * Returns 'Duos', 'Trios', 'Quads', or team count number
 *
 * @param lobby - Lobby object
 * @returns Team configuration or null
 */
export function getLobbyTeamConfig(lobby: Lobby): TeamCount | null {
  const config = lobby.gameConfig;
  if (!config) return null;

  // Check for playerTeams first (Duos, Trios, Quads)
  if (config.playerTeams) return config.playerTeams;

  // Check for teamCount or teams
  const teamCount = config.teamCount ?? config.teams;
  if (typeof teamCount === 'number') return teamCount;

  return null;
}

/**
 * Get lobby capacity (max players)
 *
 * @param lobby - Lobby object
 * @returns Capacity or null
 */
export function getLobbyCapacity(lobby: Lobby): number | null {
  const config = lobby.gameConfig;
  if (!config) return null;

  // Try multiple possible fields
  return config.maxClients ?? config.maxPlayers ?? config.maxPlayersPerGame ?? lobby.maxClients ?? null;
}

/**
 * Get human-readable game details text
 *
 * @param lobby - Lobby object
 * @returns Formatted game details string
 */
export function getGameDetailsText(lobby: Lobby): string {
  const gameMode = getLobbyGameMode(lobby);
  const teamConfig = getLobbyTeamConfig(lobby);
  const capacity = getLobbyCapacity(lobby);

  if (gameMode === 'FFA') {
    return capacity !== null ? `FFA (${capacity} max players)` : 'FFA';
  }

  if (gameMode === 'Team') {
    if (teamConfig === 'Duos') return 'Duos';
    if (teamConfig === 'Trios') return 'Trios';
    if (teamConfig === 'Quads') return 'Quads';

    if (typeof teamConfig === 'number' && capacity !== null) {
      const playersPerTeam = getPlayersPerTeam(teamConfig, capacity);
      return playersPerTeam !== null
        ? `${teamConfig} teams (${playersPerTeam} per team)`
        : `${teamConfig} teams`;
    }

    return 'Team';
  }

  return 'Unknown';
}
