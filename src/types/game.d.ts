/**
 * Type definitions for OpenFront.io game data structures
 */

/**
 * Game configuration settings
 */
export interface GameConfig {
  gameMode: 'Free For All' | 'Team' | string;
  playerTeams?: 'Duos' | 'Trios' | 'Quads' | number;
  teams?: number;
  teamCount?: number;
  maxClients?: number;
  maxPlayers?: number;
  maxPlayersPerGame?: number;
}

/**
 * Lobby information from the server
 */
export interface Lobby {
  gameID: string;
  gameConfig: GameConfig;
  maxClients?: number;
}

/**
 * WebSocket message for lobby updates
 */
export interface LobbiesUpdateMessage {
  type: 'lobbies_update';
  data?: {
    lobbies: Lobby[];
  };
}

/**
 * Clan statistics from the leaderboard
 */
export interface ClanStats {
  clanTag: string;
  wins: number;
  losses: number;
  weightedWLRatio?: number;
}

/**
 * Clan leaderboard API response
 */
export interface ClanLeaderboardResponse {
  clans: ClanStats[];
}

/**
 * Game client data (for player list)
 */
export interface GameClient {
  username: string;
  [key: string]: any;
}

/**
 * Game data API response
 */
export interface GameData {
  clients: Record<string, GameClient>;
  [key: string]: any;
}

/**
 * Panel position for draggable panels
 */
export interface PanelPosition {
  x: number;
  y: number;
}

/**
 * Panel size for resizable panels
 */
export interface PanelSize {
  width: number;
  height: number;
}
