/**
 * Tests for ClanLeaderboardCache
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClanLeaderboardCache } from '@/data/ClanLeaderboardCache';
import type { ClanStats } from '@/types/game';

describe('ClanLeaderboardCache', () => {
  beforeEach(() => {
    // Reset cache state between tests
    ClanLeaderboardCache.data = null;
    ClanLeaderboardCache.dataByTag = null;
    ClanLeaderboardCache.fetching = false;
    ClanLeaderboardCache.fetched = false;

    // Clear all mocks
    vi.restoreAllMocks();
  });

  it('should return cached data on subsequent calls', async () => {
    const mockClanData: ClanStats[] = [
      { clanTag: 'TEST', wins: 100, losses: 50, weightedWLRatio: 2.0 },
    ];

    // Mock successful fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clans: mockClanData }),
    } as Response);

    // First call should fetch
    const result1 = await ClanLeaderboardCache.fetch();
    expect(result1).toEqual(mockClanData);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call should return cached data (no additional fetch)
    const result2 = await ClanLeaderboardCache.fetch();
    expect(result2).toEqual(mockClanData);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only 1 call
  });

  it('should build lookup map by clan tag (case-insensitive)', async () => {
    const mockClanData: ClanStats[] = [
      { clanTag: 'ALPHA', wins: 100, losses: 50, weightedWLRatio: 2.0 },
      { clanTag: 'BETA', wins: 200, losses: 100, weightedWLRatio: 2.0 },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clans: mockClanData }),
    } as Response);

    await ClanLeaderboardCache.fetch();

    // Test case-insensitive lookup
    expect(ClanLeaderboardCache.getStats('ALPHA')).toEqual(mockClanData[0]);
    expect(ClanLeaderboardCache.getStats('alpha')).toEqual(mockClanData[0]);
    expect(ClanLeaderboardCache.getStats('AlPhA')).toEqual(mockClanData[0]);
    expect(ClanLeaderboardCache.getStats('BETA')).toEqual(mockClanData[1]);
  });

  it('should return null for non-existent clan tags', async () => {
    const mockClanData: ClanStats[] = [
      { clanTag: 'TEST', wins: 100, losses: 50, weightedWLRatio: 2.0 },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clans: mockClanData }),
    } as Response);

    await ClanLeaderboardCache.fetch();

    expect(ClanLeaderboardCache.getStats('NONEXISTENT')).toBeNull();
    expect(ClanLeaderboardCache.getStats(null)).toBeNull();
    expect(ClanLeaderboardCache.getStats(undefined)).toBeNull();
  });

  it('should handle empty clan list', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clans: [] }),
    } as Response);

    const result = await ClanLeaderboardCache.fetch();
    expect(result).toEqual([]);
    expect(ClanLeaderboardCache.getStats('ANY')).toBeNull();
  });
});
