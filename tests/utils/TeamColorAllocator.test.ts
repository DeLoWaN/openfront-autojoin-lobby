import { describe, it, expect } from 'vitest';
import { TeamColorAllocator, rgbToCss } from '@/utils/TeamColorAllocator';
import { TEAM_BASE_COLORS } from '@/config/clanColors';

describe('TeamColorAllocator', () => {
  it('should return base team colors for known teams', () => {
    const allocator = new TeamColorAllocator();
    const red = allocator.getTeamColor('Red');
    const blue = allocator.getTeamColor('Blue');
    expect(rgbToCss(red)).toBe(`rgb(${TEAM_BASE_COLORS.Red.r},${TEAM_BASE_COLORS.Red.g},${TEAM_BASE_COLORS.Red.b})`);
    expect(rgbToCss(blue)).toBe(`rgb(${TEAM_BASE_COLORS.Blue.r},${TEAM_BASE_COLORS.Blue.g},${TEAM_BASE_COLORS.Blue.b})`);
  });

  it('should return consistent colors for the same team id', () => {
    const allocator = new TeamColorAllocator();
    const teamColorA = allocator.getTeamColor('Team 1');
    const teamColorB = allocator.getTeamColor('Team 1');
    expect(rgbToCss(teamColorA)).toBe(rgbToCss(teamColorB));
  });
});
