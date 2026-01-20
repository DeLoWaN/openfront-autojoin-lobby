/**
 * Type definitions for PlayerList module
 */

/**
 * Player list settings (not all are currently used)
 */
export interface PlayerListSettings {
  showPlayerCount: boolean;
  animationsEnabled: boolean;
  debug: boolean;
}

/**
 * Default settings for player list
 */
export const DEFAULT_SETTINGS: PlayerListSettings = {
  showPlayerCount: true,
  animationsEnabled: true,
  debug: false,
};

/**
 * A group of players with the same clan tag
 */
export interface ClanGroup {
  tag: string; // Original case clan tag
  players: string[]; // Array of player names
}

/**
 * Result of grouping players by clan
 */
export interface GroupedPlayers {
  clanGroups: ClanGroup[];
  untaggedPlayers: string[];
}

/**
 * Differences between previous and current player lists
 * Used for animating player joins/leaves
 */
export interface PlayerDiff {
  added: Set<string>;
  removed: Set<string>;
  addedByClan: Map<string, string[]>; // clanTag → playerNames[]
  removedByClan: Map<string, string[]>;
  addedUntagged: string[];
  removedUntagged: string[];
  newClans: string[];
  removedClans: string[];
}
