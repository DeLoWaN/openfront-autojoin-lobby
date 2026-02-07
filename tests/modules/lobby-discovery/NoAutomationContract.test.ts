import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('No automation contract', () => {
  it('does not call lobby join APIs from discovery UI', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/modules/lobby-discovery/LobbyDiscoveryUI.ts'),
      'utf-8'
    );

    expect(source.includes('tryJoinLobby(')).toBe(false);
    expect(source.includes('handleClanmateUpdate(')).toBe(false);
  });

  it('does not include auto-rejoin behavior in player list clan tag apply flow', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/modules/player-list/PlayerListUI.ts'),
      'utf-8'
    );

    expect(source.includes('performLobbyRejoin(')).toBe(false);
    expect(source.includes('getAutoRejoinOnClanChange(')).toBe(false);
    expect(source.includes('tryJoinLobby(')).toBe(false);
  });
});
