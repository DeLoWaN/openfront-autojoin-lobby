/**
 * Type definitions for AutoJoin module
 */

/**
 * Join mode - either automatically join or just notify
 */
export type JoinMode = 'autojoin' | 'notify';

/**
 * Team count options for Team game mode
 */
export type TeamCount = 'Duos' | 'Trios' | 'Quads' | number;

/**
 * Criteria for matching lobbies
 */
export interface AutoJoinCriteria {
  gameMode: 'FFA' | 'Team';
  teamCount?: TeamCount | null;
  minPlayers: number | null;
  maxPlayers: number | null;
}

/**
 * Auto-join settings stored in GM_storage
 */
export interface AutoJoinSettings {
  criteria: AutoJoinCriteria[];
  autoJoinEnabled: boolean;
  soundEnabled: boolean;
  joinMode: JoinMode;
  isTeamThreeTimesMinEnabled: boolean;
}
