import { describe, it, expect } from 'vitest';
import { LobbyDiscoveryEngine } from '@/modules/lobby-discovery/LobbyDiscoveryEngine';

const engine = new LobbyDiscoveryEngine();

describe('LobbyDiscoveryEngine', () => {
  it('matches valid Team criteria', () => {
    const lobby = {
      gameID: 'team-1',
      gameConfig: {
        gameMode: 'Team',
        teamCount: 4,
        maxClients: 16,
      },
      maxClients: 16,
    } as any;

    const criteria = [{ gameMode: 'Team', teamCount: 4, minPlayers: 3, maxPlayers: 5 }] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(true);
  });

  it('does not match removed HvN mode', () => {
    const lobby = {
      gameID: 'hvn-1',
      gameConfig: {
        gameMode: 'Team',
        playerTeams: 'Humans Vs Nations',
        maxClients: 40,
      },
      maxClients: 40,
    } as any;

    const criteria = [{ gameMode: 'Team', teamCount: null, minPlayers: null, maxPlayers: null }] as any;

    expect(engine.matchesCriteria(lobby, criteria)).toBe(false);
  });

  it('applies players-per-team constraints', () => {
    const lobby = {
      gameID: 'team-2',
      gameConfig: {
        gameMode: 'Team',
        teamCount: 2,
        maxClients: 10,
      },
      maxClients: 10,
    } as any;

    const tooHighMin = [{ gameMode: 'Team', teamCount: 2, minPlayers: 6, maxPlayers: null }] as any;
    const validRange = [{ gameMode: 'Team', teamCount: 2, minPlayers: 4, maxPlayers: 5 }] as any;

    expect(engine.matchesCriteria(lobby, tooHighMin)).toBe(false);
    expect(engine.matchesCriteria(lobby, validRange)).toBe(true);
  });
});
