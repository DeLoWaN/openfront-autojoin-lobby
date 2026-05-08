import { describe, it, expect } from 'vitest';
import { LobbyDiscoveryEngine } from '@/modules/lobby-discovery/LobbyDiscoveryEngine';

const engine = new LobbyDiscoveryEngine();

describe('LobbyDiscoveryEngine', () => {
  it('matches FFA by lobby capacity', () => {
    const lobby = {
      gameID: 'ffa-1',
      publicGameType: 'ffa',
      numClients: 7,
      gameConfig: {
        gameMode: 'Free For All',
        maxPlayers: 20,
      },
    } as any;

    const criteria = [{ gameMode: 'FFA', teamCount: null, minPlayers: 10, maxPlayers: 30 }] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('matches valid Team criteria by players per team', () => {
    const lobby = {
      gameID: 'team-1',
      publicGameType: 'team',
      numClients: 17,
      gameConfig: {
        gameMode: 'Team',
        teamCount: 4,
        maxClients: 32,
      },
      maxClients: 32,
    } as any;

    const criteria = [{ gameMode: 'Team', teamCount: 4, minPlayers: 4, maxPlayers: 8 }] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('matches Humans Vs Nations with human-capacity semantics', () => {
    const lobby = {
      gameID: 'hvn-1',
      publicGameType: 'special',
      numClients: 6,
      gameConfig: {
        gameMode: 'Team',
        playerTeams: 'Humans Vs Nations',
        maxClients: 40,
      },
      maxClients: 40,
    } as any;

    const criteria = [
      {
        gameMode: 'Team',
        teamCount: 'Humans Vs Nations',
        minPlayers: 30,
        maxPlayers: 50,
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('treats special queue as source only and still applies Team rules', () => {
    const lobby = {
      gameID: 'team-2',
      publicGameType: 'special',
      gameConfig: {
        gameMode: 'Team',
        teamCount: 6,
        maxClients: 72,
      },
      maxClients: 72,
    } as any;

    const validRange = [{ gameMode: 'Team', teamCount: 6, minPlayers: 10, maxPlayers: 12 }] as any;

    expect(engine.matchesCriteria(lobby, validRange)).toBe(true);
  });

  it('rejects a Team lobby whose per-team count is above the criterion max (2x-locked range)', () => {
    // 2x-lock would be reflected in the criterion as maxPlayers = minPlayers * 2.
    // Lobby has 5 per team; criterion is [2, 4].
    const lobby = {
      gameID: 'team-2x-locked',
      publicGameType: 'team',
      gameConfig: {
        gameMode: 'Team',
        teamCount: 4,
        maxClients: 20,
      },
      maxClients: 20,
    } as any;

    const criteria = [{ gameMode: 'Team', teamCount: 4, minPlayers: 2, maxPlayers: 4 }] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(false);
  });

  it('matches Humans Vs Nations against criterion capacity bounds (no special 2x branch)', () => {
    const lobby = {
      gameID: 'hvn-cap',
      publicGameType: 'special',
      gameConfig: {
        gameMode: 'Team',
        playerTeams: 'Humans Vs Nations',
        maxClients: 62,
      },
      maxClients: 62,
    } as any;

    const criteria = [
      { gameMode: 'Team', teamCount: 'Humans Vs Nations', minPlayers: 40, maxPlayers: 70 },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('applies blocked boolean and numeric modifier filters as an exclusion list', () => {
    const lobby = {
      gameID: 'spec-2',
      publicGameType: 'special',
      gameConfig: {
        gameMode: 'Free For All',
        maxPlayers: 25,
        publicGameModifiers: {
          isCompact: true,
          startingGold: 5000000,
          goldMultiplier: 2,
        },
      },
    } as any;

    const anyCriteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: {
          isCompact: 'any',
          startingGold: { 1000000: 'any', 5000000: 'any', 25000000: 'any' },
          goldMultiplier: { 2: 'any' },
        },
      },
    ] as any;

    const blockedCriteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: {
          isCompact: 'any',
          startingGold: { 1000000: 'any', 5000000: 'blocked', 25000000: 'any' },
          goldMultiplier: { 2: 'any' },
        },
      },
    ] as any;

    const blockedBooleanCriteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: {
          isCompact: 'blocked',
          startingGold: { 5000000: 'any' },
          goldMultiplier: { 2: 'any' },
        },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, anyCriteria)).toBe(true);
    expect(engine.matchesCriteria(lobby, blockedCriteria)).toBe(false);
    expect(engine.matchesCriteria(lobby, blockedBooleanCriteria)).toBe(false);
  });

  it('matches when a required boolean modifier is present', () => {
    const lobby = {
      gameID: 'ffa-required-on',
      publicGameType: 'ffa',
      gameConfig: {
        gameMode: 'Free For All',
        maxPlayers: 25,
        publicGameModifiers: { isCompact: true },
      },
    } as any;

    const criteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: { isCompact: 'required' },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('rejects when a required boolean modifier is absent', () => {
    const lobby = {
      gameID: 'ffa-required-off',
      publicGameType: 'ffa',
      gameConfig: {
        gameMode: 'Free For All',
        maxPlayers: 25,
        publicGameModifiers: {},
      },
    } as any;

    const criteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: { isCompact: 'required' },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(false);
  });

  it('matches when a required numeric modifier value matches the lobby', () => {
    const lobby = {
      gameID: 'ffa-required-gold-match',
      publicGameType: 'ffa',
      gameConfig: {
        gameMode: 'Free For All',
        maxPlayers: 25,
        publicGameModifiers: { startingGold: 5000000 },
      },
    } as any;

    const criteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: {
          startingGold: { 5000000: 'required' },
        },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('rejects when a required numeric modifier value does not match the lobby', () => {
    const lobby = {
      gameID: 'ffa-required-gold-mismatch',
      publicGameType: 'ffa',
      gameConfig: {
        gameMode: 'Free For All',
        maxPlayers: 25,
        publicGameModifiers: { startingGold: 1000000 },
      },
    } as any;

    const criteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: {
          startingGold: { 5000000: 'required' },
        },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(false);
  });

  it('excludes a lobby with publicGameModifiers.startingGold=1M when 1M is excluded (regression)', () => {
    const lobby = {
      gameID: 'lisbon-pgm-1m',
      publicGameType: 'team',
      gameConfig: {
        gameMode: 'Team',
        playerTeams: 'Quads',
        maxClients: 72,
        publicGameModifiers: { startingGold: 1_000_000 },
      },
      maxClients: 72,
    } as any;

    const criteria = [
      {
        gameMode: 'Team',
        teamCount: 'Quads',
        minPlayers: 1,
        maxPlayers: 62,
        modifiers: {
          startingGold: { 1000000: 'blocked', 5000000: 'any', 25000000: 'any' },
          goldMultiplier: { 2: 'any' },
        },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(false);
  });

  it('excludes a lobby with host-set gameConfig.startingGold=1M when 1M is excluded', () => {
    // No publicGameModifiers; gold lives directly on gameConfig (host-set custom lobby).
    const lobby = {
      gameID: 'host-set-1m',
      publicGameType: 'team',
      gameConfig: {
        gameMode: 'Team',
        playerTeams: 'Quads',
        maxClients: 32,
        startingGold: 1_000_000,
      },
      maxClients: 32,
    } as any;

    const criteria = [
      {
        gameMode: 'Team',
        teamCount: 'Quads',
        minPlayers: 1,
        maxPlayers: 62,
        modifiers: {
          startingGold: { 1000000: 'blocked', 5000000: 'any', 25000000: 'any' },
        },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(false);
  });

  it('tolerates null host-set gold values', () => {
    const lobby = {
      gameID: 'null-gold',
      publicGameType: 'team',
      gameConfig: {
        gameMode: 'Team',
        playerTeams: 'Quads',
        maxClients: 32,
        startingGold: null,
        goldMultiplier: null,
      },
      maxClients: 32,
    } as any;

    const criteria = [
      {
        gameMode: 'Team',
        teamCount: 'Quads',
        minPlayers: 1,
        maxPlayers: 62,
        modifiers: {
          startingGold: { 1000000: 'blocked' },
        },
      },
    ] as any;

    // No gold set → no exclusion firing → match (only blocked, no required).
    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('rejects when a required numeric modifier is absent from the lobby', () => {
    const lobby = {
      gameID: 'ffa-required-gold-missing',
      publicGameType: 'ffa',
      gameConfig: {
        gameMode: 'Free For All',
        maxPlayers: 25,
        publicGameModifiers: {},
      },
    } as any;

    const criteria = [
      {
        gameMode: 'FFA',
        teamCount: null,
        minPlayers: 20,
        maxPlayers: 30,
        modifiers: {
          startingGold: { 5000000: 'required' },
        },
      },
    ] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(false);
  });

  describe('LEMNOS-style lobby: 62 teams of 2 (special source, 124 capacity)', () => {
    // Reproduces the screenshot scenario: LEMNOS, 62 TEAMS OF 2, 61/124, CROWDED + WATER NUKES + 1M STARTING GOLD
    // Two possible wire shapes from OpenFront — numeric playerTeams vs named 'Duos' preset.

    const makeLemnos = (playerTeams: number | string) => ({
      gameID: 'lemnos-1',
      publicGameType: 'special',
      numClients: 61,
      gameConfig: {
        gameMode: 'Team',
        playerTeams,
        maxPlayers: 124,
        publicGameModifiers: {
          isCrowded: true,
          isWaterNukes: true,
          startingGold: 1_000_000,
        },
      },
    } as any);

    // All 8 format chips selected (HvN + 2 + 3 + 4 + 5 + 6 + 7 + 8+), PPT [2, 15]
    // This is the exact state shown in the screenshot (9 active filters = Teams + 8 chips).
    const allChipsCriteria = [
      { gameMode: 'Team', teamCount: 'Humans Vs Nations', minPlayers: 2, maxPlayers: 15 },
      { gameMode: 'Team', teamCount: 2, minPlayers: 2, maxPlayers: 15 },
      { gameMode: 'Team', teamCount: 3, minPlayers: 2, maxPlayers: 15 },
      { gameMode: 'Team', teamCount: 4, minPlayers: 2, maxPlayers: 15 },
      { gameMode: 'Team', teamCount: 5, minPlayers: 2, maxPlayers: 15 },
      { gameMode: 'Team', teamCount: 6, minPlayers: 2, maxPlayers: 15 },
      { gameMode: 'Team', teamCount: 7, minPlayers: 2, maxPlayers: 15 },
      { gameMode: 'Team', teamCount: '8+', minPlayers: 2, maxPlayers: 15 },
    ] as any;

    // No format chips selected, PPT [2, 15] — "filter disabled" state
    const noFormatCriteria = [
      { gameMode: 'Team', teamCount: null, minPlayers: 2, maxPlayers: 15 },
    ] as any;

    describe('playerTeams: 62 (numeric team count — most likely wire format)', () => {
      it('matches with all chips selected (8+ covers 62 teams, 2 PPT in [2,15])', () => {
        expect(engine.matchesCriteria(makeLemnos(62), allChipsCriteria)).toBe(true);
      });

      it('matches with no format chips (null teamCount, 2 PPT in [2,15])', () => {
        expect(engine.matchesCriteria(makeLemnos(62), noFormatCriteria)).toBe(true);
      });

      it('matches with only 8+ chip selected', () => {
        const criteria = [{ gameMode: 'Team', teamCount: '8+', minPlayers: 2, maxPlayers: 15 }] as any;
        expect(engine.matchesCriteria(makeLemnos(62), criteria)).toBe(true);
      });

      it('does not match with only HvN chip selected', () => {
        const criteria = [{ gameMode: 'Team', teamCount: 'Humans Vs Nations', minPlayers: 2, maxPlayers: 15 }] as any;
        expect(engine.matchesCriteria(makeLemnos(62), criteria)).toBe(false);
      });
    });

    describe('playerTeams: "Duos" (named preset — alternative wire format)', () => {
      it('matches with all chips selected — 8+ resolves Duos to 62 teams via capacity', () => {
        expect(engine.matchesCriteria(makeLemnos('Duos'), allChipsCriteria)).toBe(true);
      });

      it('matches with no format chips (null teamCount, getPlayersPerTeam("Duos")=2 in [2,15])', () => {
        expect(engine.matchesCriteria(makeLemnos('Duos'), noFormatCriteria)).toBe(true);
      });

      it('matches with only 8+ chip — resolves Duos+124 capacity to 62 teams >= 8', () => {
        const criteria = [{ gameMode: 'Team', teamCount: '8+', minPlayers: 2, maxPlayers: 15 }] as any;
        expect(engine.matchesCriteria(makeLemnos('Duos'), criteria)).toBe(true);
      });
    });
  });

  describe('8+ team count matching', () => {
    const make8PlusCriteria = (minPPT: number, maxPPT: number) => [
      { gameMode: 'Team', teamCount: '8+', minPlayers: minPPT, maxPlayers: maxPPT },
    ] as any;

    it('matches a lobby with exactly 8 teams', () => {
      const lobby = {
        gameID: '8teams-1',
        publicGameType: 'team',
        numClients: 16,
        gameConfig: {
          gameMode: 'Team',
          teamCount: 8,
          maxClients: 16,
        },
        maxClients: 16,
      } as any;
      // 8 teams, 16/8 = 2 players per team — within [2, 10]
      expect(engine.matchesCriteria(lobby, make8PlusCriteria(2, 10))).toBe(true);
    });

    it('matches a lobby with 10 teams', () => {
      const lobby = {
        gameID: '10teams-1',
        publicGameType: 'team',
        numClients: 14,
        gameConfig: {
          gameMode: 'Team',
          teamCount: 10,
          maxClients: 20,
        },
        maxClients: 20,
      } as any;
      // 10 teams, 20/10 = 2 players per team — within [2, 10]
      expect(engine.matchesCriteria(lobby, make8PlusCriteria(2, 10))).toBe(true);
    });

    it('does not match a lobby with 7 teams', () => {
      const lobby = {
        gameID: '7teams-1',
        publicGameType: 'team',
        numClients: 14,
        gameConfig: {
          gameMode: 'Team',
          teamCount: 7,
          maxClients: 14,
        },
        maxClients: 14,
      } as any;
      expect(engine.matchesCriteria(lobby, make8PlusCriteria(2, 10))).toBe(false);
    });

    it('respects players-per-team bounds for 8+ lobbies', () => {
      const lobby = {
        gameID: '10teams-big',
        publicGameType: 'team',
        numClients: 30,
        gameConfig: {
          gameMode: 'Team',
          teamCount: 10,
          maxClients: 100,
        },
        maxClients: 100,
      } as any;
      // 10 teams, 100/10 = 10 players per team — outside [2, 5]
      expect(engine.matchesCriteria(lobby, make8PlusCriteria(2, 5))).toBe(false);
    });

    it('does not match Humans Vs Nations with 8+ criteria', () => {
      const lobby = {
        gameID: 'hvn-1',
        publicGameType: 'special',
        numClients: 6,
        gameConfig: {
          gameMode: 'Team',
          playerTeams: 'Humans Vs Nations',
          maxClients: 60,
        },
        maxClients: 60,
      } as any;
      expect(engine.matchesCriteria(lobby, make8PlusCriteria(2, 62))).toBe(false);
    });
  });
});
