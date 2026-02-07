/**
 * Type definitions for the lobby discovery module.
 */

export type TeamCount = 'Duos' | 'Trios' | 'Quads' | number;

export interface DiscoveryCriteria {
  gameMode: 'Team';
  teamCount?: TeamCount | null;
  minPlayers: number | null;
  maxPlayers: number | null;
}

export interface LobbyDiscoverySettings {
  criteria: DiscoveryCriteria[];
  discoveryEnabled: boolean;
  soundEnabled: boolean;
  isTeamThreeTimesMinEnabled: boolean;
}

export interface LegacyAutoJoinSettings {
  criteria?: Array<{
    gameMode?: string | null;
    teamCount?: string | number | null;
    minPlayers?: number | null;
    maxPlayers?: number | null;
  }>;
  autoJoinEnabled?: boolean;
  soundEnabled?: boolean;
  isTeamThreeTimesMinEnabled?: boolean;
}
