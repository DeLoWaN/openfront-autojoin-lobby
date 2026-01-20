/**
 * Helper functions for PlayerList module
 * These are pure functions with no side effects
 */

import { CONFIG } from '@/config/constants';
import type { ClanGroup, GroupedPlayers } from './PlayerListTypes';

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
