/**
 * Helper functions for PlayerList module
 * These are pure functions with no side effects
 */

import { CONFIG } from '@/config/constants';
import type { ClanGroup, GroupedPlayers, PlayerDiff } from './PlayerListTypes';

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
