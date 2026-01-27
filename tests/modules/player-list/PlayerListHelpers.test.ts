/**
 * Unit tests for PlayerListHelpers
 */

import { describe, it, expect } from 'vitest';
import {
  stripClanTag,
  groupPlayersByClan,
  getTeamListForLobby,
  computeClanTeamMap,
  buildTeamGroups,
  mapNameToFileKey,
} from '@/modules/player-list/PlayerListHelpers';

describe('stripClanTag', () => {
  it('should strip standard clan tag format with space', () => {
    const result1 = stripClanTag('[ABC] PlayerName');
    const result2 = stripClanTag('[CLAN] JohnDoe');
    const result3 = stripClanTag('[XY] Test');
    expect(result1).toBe('PlayerName');
    expect(result2).toBe('JohnDoe');
    expect(result3).toBe('Test');
  });

  it('should strip clan tag without space', () => {
    const result1 = stripClanTag('[ABC]PlayerName');
    const result2 = stripClanTag('[CLAN]JohnDoe');
    expect(result1).toBe('PlayerName');
    expect(result2).toBe('JohnDoe');
  });

  it('should handle name without clan tag', () => {
    const result1 = stripClanTag('PlayerName');
    const result2 = stripClanTag('JohnDoe');
    expect(result1).toBe('PlayerName');
    expect(result2).toBe('JohnDoe');
  });

  it('should preserve brackets not at the start', () => {
    const result1 = stripClanTag('Player[Name]');
    const result2 = stripClanTag('John[Doe]');
    expect(result1).toBe('Player[Name]');
    expect(result2).toBe('John[Doe]');
  });

  it('should handle empty string', () => {
    const result = stripClanTag('');
    expect(result).toBe('');
  });

  it('should handle name with only clan tag', () => {
    const result1 = stripClanTag('[ABC]');
    const result2 = stripClanTag('[CLAN] ');
    expect(result1).toBe('');
    expect(result2).toBe('');
  });

  it('should handle clan tags with different lengths (2-5 chars)', () => {
    const result1 = stripClanTag('[AB] Name');
    const result2 = stripClanTag('[ABC] Name');
    const result3 = stripClanTag('[ABCD] Name');
    const result4 = stripClanTag('[ABCDE] Name');
    expect(result1).toBe('Name');
    expect(result2).toBe('Name');
    expect(result3).toBe('Name');
    expect(result4).toBe('Name');
  });

  it('should not strip invalid clan tag formats', () => {
    const result1 = stripClanTag('[A] Name');
    const result2 = stripClanTag('[ABCDEF] Name');
    const result3 = stripClanTag('[A-B] Name');
    expect(result1).toBe('[A] Name'); // Too short (1 char)
    expect(result2).toBe('[ABCDEF] Name'); // Too long (6 chars)
    expect(result3).toBe('[A-B] Name'); // Non-alphanumeric
  });

  it('should handle multiple spaces after tag', () => {
    const result1 = stripClanTag('[ABC]  PlayerName');
    const result2 = stripClanTag('[ABC]   PlayerName');
    expect(result1).toBe(' PlayerName'); // Only strips one space
    expect(result2).toBe('  PlayerName');
  });
});

describe('getTeamListForLobby', () => {
  it('should return ordered team colors for small team counts', () => {
    const config = { gameMode: 'Team', teamCount: 3 } as any;
    const teams = getTeamListForLobby(config, 6, 0);
    expect(teams).toEqual(['Red', 'Blue', 'Yellow']);
  });

  it('should handle Humans Vs Nations config', () => {
    const config = { gameMode: 'Team', playerTeams: 'Humans Vs Nations' } as any;
    const teams = getTeamListForLobby(config, 5, 0);
    expect(teams).toEqual(['Humans', 'Nations']);
  });

  it('should compute team count from Duos', () => {
    const config = { gameMode: 'Team', playerTeams: 'Duos' } as any;
    const teams = getTeamListForLobby(config, 5, 0);
    expect(teams).toEqual(['Team 1', 'Team 2', 'Team 3']);
  });
});

describe('computeClanTeamMap', () => {
  it('should keep larger clans together and balance teams', () => {
    const config = { gameMode: 'Team', teamCount: 2 } as any;
    const names = ['[AAA] One', '[AAA] Two', '[AAA] Three', '[BB] Solo', '[CC] Solo'];
    const map = computeClanTeamMap(names, config, 0);
    expect(map.get('aaa')).toBe('Red');
    expect(map.get('bb')).toBe('Blue');
    expect(map.get('cc')).toBe('Blue');
  });
});

describe('buildTeamGroups', () => {
  it('should group clans and solo players under teams', () => {
    const config = { gameMode: 'Team', teamCount: 2 } as any;
    const names = [
      '[AAA] One',
      '[AAA] Two',
      '[BB] Solo',
      'NoClan1',
      '[CC] Solo',
      'NoClan2',
    ];
    const { clanGroups, untaggedPlayers } = groupPlayersByClan(names);
    const groups = buildTeamGroups(names, clanGroups, untaggedPlayers, config, 0);

    expect(groups.length).toBe(2);
    const red = groups.find((g) => g.team === 'Red');
    const blue = groups.find((g) => g.team === 'Blue');
    expect(red).toBeDefined();
    expect(blue).toBeDefined();
    expect(red!.clanGroups.some((g) => g.tag.toLowerCase() === 'aaa')).toBe(true);
    expect(blue!.clanGroups.some((g) => g.tag.toLowerCase() === 'bb')).toBe(true);
    expect(blue!.clanGroups.some((g) => g.tag.toLowerCase() === 'cc')).toBe(true);
    expect(red!.soloPlayers.length + blue!.soloPlayers.length).toBe(2);
  });
});

describe('mapNameToFileKey', () => {
  it('should normalize map names to file keys', () => {
    expect(mapNameToFileKey('Gulf of St. Lawrence')).toBe('gulfofstlawrence');
    expect(mapNameToFileKey('Giant World Map')).toBe('giantworldmap');
  });
});
