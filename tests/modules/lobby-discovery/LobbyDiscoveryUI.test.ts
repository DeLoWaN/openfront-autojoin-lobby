import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LobbyDiscoveryUI } from '@/modules/lobby-discovery/LobbyDiscoveryUI';
import { STORAGE_KEYS } from '@/config/constants';
import { SoundUtils } from '@/utils/SoundUtils';

vi.mock('@/utils/LobbyUtils', () => ({
  LobbyUtils: {
    isOnLobbyPage: vi.fn(() => true),
  },
}));

vi.mock('@/utils/URLObserver', () => ({
  URLObserver: {
    subscribe: vi.fn(),
  },
}));

vi.mock('@/utils/SoundUtils', () => ({
  SoundUtils: {
    playGameFoundSound: vi.fn(),
    preloadSounds: vi.fn(),
  },
}));

describe('LobbyDiscoveryUI', () => {
  let store: Map<string, any>;
  let ui: LobbyDiscoveryUI | null;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new Map();
    ui = null;

    (globalThis as any).GM_getValue = vi.fn((key: string, defaultValue?: unknown) => {
      return store.has(key) ? store.get(key) : defaultValue;
    });
    (globalThis as any).GM_setValue = vi.fn((key: string, value: unknown) => {
      store.set(key, value);
    });

    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (ui) {
      ui.cleanup();
      ui = null;
    }
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('shows one notification for repeated matching updates and deduplicates sound', () => {
    store.set(STORAGE_KEYS.lobbyDiscoverySettings, {
      criteria: [{ gameMode: 'Team', teamCount: null, minPlayers: null, maxPlayers: null }],
      discoveryEnabled: true,
      soundEnabled: true,
      isTeamThreeTimesMinEnabled: false,
    });

    ui = new LobbyDiscoveryUI();

    const lobbies = [
      {
        gameID: 'team-101',
        gameConfig: {
          gameMode: 'Team',
          teamCount: 2,
          maxClients: 10,
        },
      },
    ] as any;

    ui.receiveLobbyUpdate(lobbies);
    ui.receiveLobbyUpdate(lobbies);

    expect(document.querySelectorAll('.game-found-notification')).toHaveLength(1);
    expect(SoundUtils.playGameFoundSound).toHaveBeenCalledTimes(1);
  });

  it('respects sound toggle when disabled', () => {
    store.set(STORAGE_KEYS.lobbyDiscoverySettings, {
      criteria: [{ gameMode: 'Team', teamCount: null, minPlayers: null, maxPlayers: null }],
      discoveryEnabled: true,
      soundEnabled: false,
      isTeamThreeTimesMinEnabled: false,
    });

    ui = new LobbyDiscoveryUI();

    const lobbies = [
      {
        gameID: 'team-202',
        gameConfig: {
          gameMode: 'Team',
          teamCount: 3,
          maxClients: 12,
        },
      },
    ] as any;

    ui.receiveLobbyUpdate(lobbies);

    expect(document.querySelectorAll('.game-found-notification')).toHaveLength(1);
    expect(SoundUtils.playGameFoundSound).not.toHaveBeenCalled();
  });
});
