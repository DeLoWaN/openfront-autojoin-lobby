/**
 * Helper functions for the lobby discovery module.
 * Pure functions with no side effects.
 */

import type { Lobby } from '@/types/game';
import type {
  DiscoveryCriteria,
  TeamCount,
  LegacyAutoJoinSettings,
  LobbyDiscoverySettings,
} from './LobbyDiscoveryTypes';

export function normalizeGameMode(mode: string | null | undefined): 'Team' | null {
  if (!mode) return null;
  const lower = mode.toLowerCase().trim();
  if (lower === 'team' || lower === 'teams') return 'Team';
  return null;
}

export function getLobbyGameMode(lobby: Lobby): 'Team' | null {
  return normalizeGameMode(lobby.gameConfig?.gameMode);
}

export function parseTeamCount(value: string | number | null | undefined): TeamCount | null {
  if (value === 'Duos' || value === 'Trios' || value === 'Quads') return value;

  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function getLobbyTeamConfig(lobby: Lobby): TeamCount | null {
  const config = lobby.gameConfig;
  if (!config) return null;

  if (config.playerTeams === 'Humans Vs Nations') {
    return null;
  }

  const playerTeams = parseTeamCount(config.playerTeams);
  if (playerTeams !== null) {
    return playerTeams;
  }

  return parseTeamCount(config.teamCount ?? config.teams ?? null);
}

export function getLobbyCapacity(lobby: Lobby): number | null {
  const config = lobby.gameConfig;
  if (!config) return null;

  return config.maxClients ?? config.maxPlayers ?? config.maxPlayersPerGame ?? lobby.maxClients ?? null;
}

export function getPlayersPerTeam(
  playerTeams: TeamCount | null | undefined,
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

export function getGameDetailsText(lobby: Lobby): string {
  const gameMode = getLobbyGameMode(lobby);
  const teamConfig = getLobbyTeamConfig(lobby);
  const capacity = getLobbyCapacity(lobby);

  if (gameMode !== 'Team') {
    return 'Unsupported mode';
  }

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

export function sanitizeCriteria(criteria: unknown): DiscoveryCriteria[] {
  if (!Array.isArray(criteria)) {
    return [];
  }

  const sanitized: DiscoveryCriteria[] = [];

  for (const entry of criteria) {
    const candidate = entry as {
      gameMode?: string | null;
      teamCount?: string | number | null;
      minPlayers?: number | null;
      maxPlayers?: number | null;
    };

    if ((candidate.gameMode ?? '').toLowerCase() !== 'team') {
      continue;
    }

    if (candidate.teamCount === 'Humans Vs Nations') {
      continue;
    }

    sanitized.push({
      gameMode: 'Team',
      teamCount: parseTeamCount(candidate.teamCount ?? null),
      minPlayers: typeof candidate.minPlayers === 'number' ? candidate.minPlayers : null,
      maxPlayers: typeof candidate.maxPlayers === 'number' ? candidate.maxPlayers : null,
    });
  }

  return sanitized;
}

export function migrateLegacySettings(
  legacy: LegacyAutoJoinSettings | null | undefined,
  current: LobbyDiscoverySettings | null | undefined
): LobbyDiscoverySettings {
  if (current) {
    return {
      criteria: sanitizeCriteria(current.criteria),
      discoveryEnabled:
        typeof current.discoveryEnabled === 'boolean' ? current.discoveryEnabled : true,
      soundEnabled: typeof current.soundEnabled === 'boolean' ? current.soundEnabled : true,
      isTeamThreeTimesMinEnabled:
        typeof current.isTeamThreeTimesMinEnabled === 'boolean'
          ? current.isTeamThreeTimesMinEnabled
          : false,
    };
  }

  return {
    criteria: sanitizeCriteria(legacy?.criteria),
    discoveryEnabled: typeof legacy?.autoJoinEnabled === 'boolean' ? legacy.autoJoinEnabled : true,
    soundEnabled: typeof legacy?.soundEnabled === 'boolean' ? legacy.soundEnabled : true,
    isTeamThreeTimesMinEnabled:
      typeof legacy?.isTeamThreeTimesMinEnabled === 'boolean'
        ? legacy.isTeamThreeTimesMinEnabled
        : false,
  };
}
