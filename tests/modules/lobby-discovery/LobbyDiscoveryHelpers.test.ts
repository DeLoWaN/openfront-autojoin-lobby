import { describe, it, expect } from 'vitest';
import {
  sanitizeCriteria,
  migrateLegacySettings,
  getLobbyTeamConfig,
} from '@/modules/lobby-discovery/LobbyDiscoveryHelpers';

describe('LobbyDiscoveryHelpers', () => {
  it('sanitizes legacy criteria by keeping only Team mode entries', () => {
    const criteria = sanitizeCriteria([
      { gameMode: 'FFA', minPlayers: 10, maxPlayers: 30 },
      { gameMode: 'HvN', minPlayers: null, maxPlayers: null },
      { gameMode: 'Team', teamCount: 'Duos', minPlayers: 2, maxPlayers: 4 },
      { gameMode: 'team', teamCount: 3, minPlayers: 3, maxPlayers: 6 },
      { gameMode: 'Team', teamCount: 'Humans Vs Nations', minPlayers: null, maxPlayers: null },
    ]);

    expect(criteria).toEqual([
      { gameMode: 'Team', teamCount: 'Duos', minPlayers: 2, maxPlayers: 4 },
      { gameMode: 'Team', teamCount: 3, minPlayers: 3, maxPlayers: 6 },
    ]);
  });

  it('migrates legacy settings to notify-only discovery settings', () => {
    const migrated = migrateLegacySettings(
      {
        autoJoinEnabled: false,
        soundEnabled: false,
        isTeamThreeTimesMinEnabled: true,
        criteria: [
          { gameMode: 'FFA', minPlayers: 10, maxPlayers: 30 },
          { gameMode: 'Team', teamCount: 'Quads', minPlayers: 2, maxPlayers: 4 },
        ],
      },
      null
    );

    expect(migrated).toEqual({
      criteria: [{ gameMode: 'Team', teamCount: 'Quads', minPlayers: 2, maxPlayers: 4 }],
      discoveryEnabled: false,
      soundEnabled: false,
      isTeamThreeTimesMinEnabled: true,
    });
  });

  it('treats Humans Vs Nations as unsupported for team criteria matching', () => {
    const config = { gameMode: 'Team', playerTeams: 'Humans Vs Nations' } as any;
    const lobby = { gameID: 'hvn', gameConfig: config } as any;

    expect(getLobbyTeamConfig(lobby)).toBeNull();
  });
});
