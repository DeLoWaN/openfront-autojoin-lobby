/**
 * ClanLeaderboardCache - Fetches and caches clan leaderboard data
 *
 * Responsibilities:
 * - Fetch clan leaderboard from OpenFront.io API
 * - Cache data to avoid repeated API calls
 * - Provide quick lookup by clan tag
 * - Retry logic with 5-second delay on failure
 *
 * Strategy:
 * - Fetch once per session
 * - Build a Map for O(1) lookup by clan tag
 * - Handle failures gracefully with retry
 */

import type { ClanStats, ClanLeaderboardResponse } from '@/types/game';

interface ClanLeaderboardCacheSingleton {
  data: ClanStats[] | null;
  dataByTag: Map<string, ClanStats> | null;
  fetching: boolean;
  fetched: boolean;
  fetch(): Promise<ClanStats[]>;
  getStats(clanTag: string | null | undefined): ClanStats | null;
}

export const ClanLeaderboardCache: ClanLeaderboardCacheSingleton = {
  data: null,
  dataByTag: null,
  fetching: false,
  fetched: false,

  /**
   * Fetch clan leaderboard data
   * Only fetches once - subsequent calls return cached data
   * Retries once after 5 seconds on failure
   *
   * @returns Array of clan statistics
   */
  async fetch(): Promise<ClanStats[]> {
    // Return cached data if already fetched or currently fetching
    if (this.fetched || this.fetching) {
      return this.data || [];
    }

    this.fetching = true;

    /**
     * Helper function to attempt API fetch
     */
    const attemptFetch = async (): Promise<ClanLeaderboardResponse> => {
      const response = await fetch('https://api.openfront.io/public/clans/leaderboard');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    };

    try {
      // First attempt
      const json = await attemptFetch();
      this.data = json.clans || [];
      this.dataByTag = new Map();

      // Build lookup map (clan tag -> stats)
      for (const clan of this.data) {
        this.dataByTag.set(clan.clanTag.toLowerCase(), clan);
      }

      this.fetched = true;
      console.log('[Bundle] Clan leaderboard cached:', this.data.length, 'clans');
    } catch (firstError) {
      // First attempt failed - wait 5 seconds and retry
      console.warn(
        '[Bundle] Clan fetch failed, retrying...',
        firstError instanceof Error ? firstError.message : String(firstError)
      );

      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        // Retry attempt
        const json = await attemptFetch();
        this.data = json.clans || [];
        this.dataByTag = new Map();

        // Build lookup map
        for (const clan of this.data) {
          this.dataByTag.set(clan.clanTag.toLowerCase(), clan);
        }

        this.fetched = true;
        console.log('[Bundle] Clan leaderboard cached (retry):', this.data.length, 'clans');
      } catch (retryError) {
        // Both attempts failed - give up
        console.error(
          '[Bundle] Clan leaderboard unavailable:',
          retryError instanceof Error ? retryError.message : String(retryError)
        );
        this.data = [];
        this.dataByTag = new Map();
        this.fetched = true;
      }
    }

    this.fetching = false;
    return this.data || [];
  },

  /**
   * Get statistics for a specific clan by tag
   * Case-insensitive lookup
   *
   * @param clanTag - Clan tag to lookup (e.g., "CLAN" or "clan")
   * @returns Clan statistics or null if not found
   */
  getStats(clanTag: string | null | undefined): ClanStats | null {
    if (!this.dataByTag || !clanTag) {
      return null;
    }
    return this.dataByTag.get(clanTag.toLowerCase()) || null;
  },
};
