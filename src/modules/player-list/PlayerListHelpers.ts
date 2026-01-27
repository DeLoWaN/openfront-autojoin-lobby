/**
 * Helper functions for PlayerList module
 * These are pure functions with no side effects
 */

import { CONFIG } from '@/config/constants';
import { TEAM_ORDERED_COLORS } from '@/config/clanColors';
import type { GameConfig } from '@/types/game';
import type { ClanGroup, GroupedPlayers, PlayerDiff, TeamGroup } from './PlayerListTypes';

/**
 * Extract clan tag from player name
 * Clan tags are in format [TAG] where TAG is 2-5 alphanumeric characters
 *
 * @param name - Player name (e.g., "[CLAN] PlayerName")
 * @returns Clan tag or null if no tag found
 */
export function getPlayerClanTag(name: string | null | undefined): string | null {
  if (!name) {
    return null;
  }
  const match = name.trim().match(/\[([a-zA-Z0-9]{2,5})\]/);
  return match ? (match[1] ?? null) : null;
}

/**
 * Strip clan tag prefix from player name
 * Removes [TAG] prefix and optional space from the beginning of the name
 *
 * @param name - Full player name (e.g., "[CLAN] PlayerName" or "[CLAN]PlayerName")
 * @returns Name without clan tag prefix (e.g., "PlayerName")
 */
export function stripClanTag(name: string): string {
  if (!name) {
    return name;
  }
  // Remove [TAG] and at most one trailing space after the tag
  return name.replace(/^\[([a-zA-Z0-9]{2,5})\]\s?/, '');
}

export type TeamConfigValue =
  | 'Duos'
  | 'Trios'
  | 'Quads'
  | 'Humans Vs Nations'
  | number
  | null;

interface PlayerEntry {
  name: string;
  clan: string | null;
}

interface TeamAssignments {
  teams: string[];
  clanTeamMap: Map<string, string>;
  soloTeamMap: Map<string, string>;
}

function selectTeamWithFewestPlayers(
  teams: string[],
  teamPlayerCount: Map<string, number>
): { team: string | null; teamSize: number } {
  let team: string | null = null;
  let teamSize = 0;
  for (const t of teams) {
    const p = teamPlayerCount.get(t) ?? 0;
    if (team !== null && teamSize <= p) continue;
    teamSize = p;
    team = t;
  }
  return { team, teamSize };
}

export function getLobbyTeamConfig(gameConfig: GameConfig | null | undefined): TeamConfigValue {
  if (!gameConfig) return null;
  if (gameConfig.playerTeams) return gameConfig.playerTeams;
  const teamCount = gameConfig.teamCount ?? gameConfig.teams;
  if (typeof teamCount === 'number') return teamCount;
  return null;
}

export function getTeamListForLobby(
  gameConfig: GameConfig | null | undefined,
  playerCount: number,
  nationCount: number
): string[] {
  if (!gameConfig || gameConfig.gameMode !== 'Team') {
    return [];
  }

  const config = getLobbyTeamConfig(gameConfig);
  if (config === 'Humans Vs Nations') {
    return ['Humans', 'Nations'];
  }

  const useNumberedTeams = config === 'Duos' || config === 'Trios' || config === 'Quads';
  let numTeams = 2;
  if (typeof config === 'number') {
    numTeams = Math.max(2, config);
  } else {
    const divisor = config === 'Duos' ? 2 : config === 'Trios' ? 3 : config === 'Quads' ? 4 : 2;
    const maxPlayers =
      gameConfig.maxClients ?? gameConfig.maxPlayers ?? gameConfig.maxPlayersPerGame ?? null;
    const totalPlayers =
      maxPlayers !== null ? Math.max(playerCount, maxPlayers) : playerCount;
    numTeams = Math.max(2, Math.ceil((totalPlayers + nationCount) / divisor));
  }

  if (useNumberedTeams) {
    return Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);
  }

  if (numTeams < 8) {
    return TEAM_ORDERED_COLORS.slice(0, numTeams);
  }

  return Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);
}

export function getMaxTeamSize(numPlayers: number, numTeams: number): number {
  return Math.ceil(numPlayers / numTeams);
}

export function computeClanTeamMap(
  names: string[],
  gameConfig: GameConfig | null | undefined,
  nationCount: number
): Map<string, string> {
  if (!gameConfig || gameConfig.gameMode !== 'Team') {
    return new Map();
  }

  const config = getLobbyTeamConfig(gameConfig);
  if (config === 'Humans Vs Nations') {
    const clanTeams = new Map<string, string>();
    for (const name of names) {
      const tag = getPlayerClanTag(name);
      if (tag) {
        clanTeams.set(tag.toLowerCase(), 'Humans');
      }
    }
    return clanTeams;
  }

  const { clanTeamMap } = computeTeamAssignments(names, gameConfig, nationCount);
  return clanTeamMap;
}

function computeTeamAssignments(
  names: string[],
  gameConfig: GameConfig | null | undefined,
  nationCount: number
): TeamAssignments {
  if (!gameConfig || gameConfig.gameMode !== 'Team') {
    return { teams: [], clanTeamMap: new Map(), soloTeamMap: new Map() };
  }

  const config = getLobbyTeamConfig(gameConfig);
  const teams = getTeamListForLobby(gameConfig, names.length, nationCount);
  if (teams.length === 0) {
    return { teams: [], clanTeamMap: new Map(), soloTeamMap: new Map() };
  }

  const clanTeamMap = new Map<string, string>();
  const soloTeamMap = new Map<string, string>();

  if (config === 'Humans Vs Nations') {
    for (const name of names) {
      const tag = getPlayerClanTag(name);
      if (tag) {
        clanTeamMap.set(tag.toLowerCase(), 'Humans');
      } else {
        soloTeamMap.set(name, 'Humans');
      }
    }
    return { teams, clanTeamMap, soloTeamMap };
  }

  const maxTeamSize = getMaxTeamSize(names.length + nationCount, teams.length);
  const clanGroups = new Map<string, PlayerEntry[]>();
  const noClanPlayers: PlayerEntry[] = [];

  for (const name of names) {
    const tag = getPlayerClanTag(name);
    const entry: PlayerEntry = { name, clan: tag };
    if (tag) {
      if (!clanGroups.has(tag)) {
        clanGroups.set(tag, []);
      }
      clanGroups.get(tag)!.push(entry);
    } else {
      noClanPlayers.push(entry);
    }
  }

  const sortedClans = Array.from(clanGroups.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  const teamPlayerCount = new Map<string, number>();

  for (const [clanTag, clanPlayers] of sortedClans) {
    const { team, teamSize } = selectTeamWithFewestPlayers(teams, teamPlayerCount);
    if (!team) continue;
    clanTeamMap.set(clanTag.toLowerCase(), team);

    let nextTeamSize = teamSize;
    for (const _player of clanPlayers) {
      if (nextTeamSize < maxTeamSize) {
        nextTeamSize++;
      }
    }

    teamPlayerCount.set(team, nextTeamSize);
  }

  for (const player of noClanPlayers) {
    const { team, teamSize } = selectTeamWithFewestPlayers(teams, teamPlayerCount);
    if (!team) continue;
    soloTeamMap.set(player.name, team);
    teamPlayerCount.set(team, teamSize + 1);
  }

  return { teams, clanTeamMap, soloTeamMap };
}

export function buildTeamGroups(
  names: string[],
  clanGroups: ClanGroup[],
  untaggedPlayers: string[],
  gameConfig: GameConfig | null | undefined,
  nationCount: number
): TeamGroup[] {
  const { teams, clanTeamMap, soloTeamMap } = computeTeamAssignments(
    names,
    gameConfig,
    nationCount
  );

  if (teams.length === 0) {
    return [];
  }

  const teamGroupMap = new Map<string, TeamGroup>();
  for (const team of teams) {
    teamGroupMap.set(team, { team, clanGroups: [], soloPlayers: [] });
  }

  for (const group of clanGroups) {
    const team = clanTeamMap.get(group.tag.toLowerCase());
    if (team && teamGroupMap.has(team)) {
      teamGroupMap.get(team)!.clanGroups.push(group);
    }
  }

  for (const player of untaggedPlayers) {
    const team = soloTeamMap.get(player);
    if (team && teamGroupMap.has(team)) {
      teamGroupMap.get(team)!.soloPlayers.push(player);
    }
  }

  return teams
    .map((team) => teamGroupMap.get(team))
    .filter((group): group is TeamGroup => Boolean(group));
}

export function mapNameToFileKey(mapName: string | null | undefined): string | null {
  if (!mapName) return null;
  const key = mapName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return key.length > 0 ? key : null;
}

/**
 * Group players by their clan tags
 * Players without clan tags are returned separately
 *
 * @param names - Array of player names
 * @returns Grouped players by clan and untagged players
 */
export function groupPlayersByClan(names: string[]): GroupedPlayers {
  const clanMap = new Map<string, ClanGroup>();
  const untagged: string[] = [];

  for (const name of names) {
    const tag = getPlayerClanTag(name);
    if (tag) {
      const lowerTag = tag.toLowerCase();
      if (clanMap.has(lowerTag)) {
        clanMap.get(lowerTag)!.players.push(name);
      } else {
        clanMap.set(lowerTag, { tag, players: [name] });
      }
    } else {
      untagged.push(name);
    }
  }

  const clanGroups = Array.from(clanMap.values());

  return { clanGroups, untaggedPlayers: untagged };
}

/**
 * Simple hash function for strings
 * Used to determine which worker thread handles a game
 *
 * @param str - String to hash
 * @returns Hash value
 */
export function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // Convert to 32-bit integer
  }
  return Math.abs(h);
}

/**
 * Find which worker ID handles a specific game
 * OpenFront.io uses multiple worker threads
 *
 * @param gameId - Game ID
 * @returns Worker ID (0 to threadCount-1)
 */
export function findWorkerId(gameId: string): number {
  return simpleHash(gameId) % CONFIG.threadCount;
}

/**
 * Fetch game data from OpenFront.io API
 *
 * @param gameId - Game ID to fetch
 * @param workerId - Worker ID that handles this game
 * @returns Game data with client information
 */
export async function fetchGameData(
  gameId: string,
  workerId: number
): Promise<{ clients: Record<string, { username: string; [key: string]: any }> }> {
  try {
    const response = await fetch(`/w${workerId}/api/game/${gameId}`);

    // If response is HTML, the game has started
    if (response.headers.get('content-type')?.includes('text/html')) {
      throw new Error('Game started');
    }

    return await response.json();
  } catch {
    // Return empty clients on error
    return { clients: {} };
  }
}

/**
 * Calculate differences between previous and current player lists
 * Used to determine which players/clans to animate when adding/removing
 *
 * @param previousPlayers - Set of previous player names
 * @param currentPlayers - Array of current player names
 * @param previousClanGroups - Previous clan groups
 * @param currentClanGroups - Current clan groups
 * @param previousUntagged - Previous untagged players
 * @param currentUntagged - Current untagged players
 * @returns Object describing all changes
 */
export function diffPlayerSets(
  previousPlayers: Set<string>,
  currentPlayers: string[],
  previousClanGroups: ClanGroup[],
  currentClanGroups: ClanGroup[],
  previousUntagged: string[],
  currentUntagged: string[]
): PlayerDiff {
  const currentSet = new Set(currentPlayers);
  const added = new Set<string>();
  const removed = new Set<string>();

  // Find added players
  for (const player of currentPlayers) {
    if (!previousPlayers.has(player)) {
      added.add(player);
    }
  }

  // Find removed players
  for (const player of previousPlayers) {
    if (!currentSet.has(player)) {
      removed.add(player);
    }
  }

  // Build clan maps
  const previousClanMap = new Map<string, Set<string>>();
  for (const group of previousClanGroups) {
    previousClanMap.set(group.tag.toLowerCase(), new Set(group.players));
  }

  const currentClanMap = new Map<string, Set<string>>();
  for (const group of currentClanGroups) {
    currentClanMap.set(group.tag.toLowerCase(), new Set(group.players));
  }

  // Find added/removed players by clan
  const addedByClan = new Map<string, string[]>();
  const removedByClan = new Map<string, string[]>();

  // Check for new clans and added players in existing clans
  for (const [clanTag, currentPlayers] of currentClanMap) {
    const previousPlayers = previousClanMap.get(clanTag);
    if (!previousPlayers) {
      // New clan - don't track individual players, we'll animate the whole group
      continue;
    }

    const addedInClan: string[] = [];
    for (const player of currentPlayers) {
      if (!previousPlayers.has(player)) {
        addedInClan.push(player);
      }
    }

    if (addedInClan.length > 0) {
      addedByClan.set(clanTag, addedInClan);
    }
  }

  // Check for removed clans and removed players from existing clans
  for (const [clanTag, previousPlayers] of previousClanMap) {
    const currentPlayers = currentClanMap.get(clanTag);
    if (!currentPlayers) {
      // Clan removed - don't track individual players
      continue;
    }

    const removedInClan: string[] = [];
    for (const player of previousPlayers) {
      if (!currentPlayers.has(player)) {
        removedInClan.push(player);
      }
    }

    if (removedInClan.length > 0) {
      removedByClan.set(clanTag, removedInClan);
    }
  }

  // Find new and removed clans
  const newClans: string[] = [];
  const removedClans: string[] = [];

  for (const group of currentClanGroups) {
    if (!previousClanMap.has(group.tag.toLowerCase())) {
      newClans.push(group.tag);
    }
  }

  for (const group of previousClanGroups) {
    if (!currentClanMap.has(group.tag.toLowerCase())) {
      removedClans.push(group.tag);
    }
  }

  // Find added/removed untagged players
  const previousUntaggedSet = new Set(previousUntagged);
  const currentUntaggedSet = new Set(currentUntagged);

  const addedUntagged: string[] = [];
  const removedUntagged: string[] = [];

  for (const player of currentUntagged) {
    if (!previousUntaggedSet.has(player)) {
      addedUntagged.push(player);
    }
  }

  for (const player of previousUntagged) {
    if (!currentUntaggedSet.has(player)) {
      removedUntagged.push(player);
    }
  }

  return {
    added,
    removed,
    addedByClan,
    removedByClan,
    addedUntagged,
    removedUntagged,
    newClans,
    removedClans,
  };
}
