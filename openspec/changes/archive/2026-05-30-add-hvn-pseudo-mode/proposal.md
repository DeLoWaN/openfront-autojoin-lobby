# Change: Add Humans Vs Nations as Auto-Join Pseudo-Mode

## Why

OpenFront.io v0.29.0+ includes a "Humans Vs Nations" (HvN) team configuration mode. Players want the ability to filter for and auto-join specifically HvN games through the userscript's Auto-Join panel, just as they can currently filter for FFA or Team games.

Currently, the Auto-Join system only supports two game mode filters: FFA and Team. HvN games use `gameMode: "Team"` with `playerTeams: "Humans Vs Nations"` in the API, making them indistinguishable from other Team modes in the current filtering system. Players cannot specifically search for or auto-join HvN games without also matching all other Team configurations.

## What Changes

- **Add HvN checkbox**: New top-level checkbox in the Auto-Join panel UI, positioned after the Team configuration section
- **No configuration options**: HvN checkbox has no min/max player filters or team count options (per user requirements)
- **Extend type system**: Add `'HvN'` as a valid `gameMode` value in `AutoJoinCriteria` interface
- **Update matching logic**: HvN criteria matches lobbies where `gameMode === "Team"` AND `playerTeams === "Humans Vs Nations"`
- **Independent selection**: HvN can be selected alone or alongside FFA and/or Team modes
- **Settings persistence**: HvN selection saved to existing `autoJoinSettings` storage

## Implementation Approach

HvN is implemented as a **pseudo-mode** - it appears as a peer to FFA and Team in the UI, but internally creates Team mode criteria with a specific `playerTeams` constraint. This approach provides:

1. **Clear UX**: Users see HvN as a distinct option alongside FFA/Team
2. **Backend consistency**: HvN leverages existing Team mode matching infrastructure
3. **API alignment**: Matches how OpenFront.io represents HvN (Team mode + playerTeams field)

## Impact

- **Affected code**:
  - [src/modules/auto-join/AutoJoinTypes.ts](../../src/modules/auto-join/AutoJoinTypes.ts) - Extend `gameMode` type
  - [src/modules/auto-join/AutoJoinHelpers.ts](../../src/modules/auto-join/AutoJoinHelpers.ts) - Add HvN detection helpers
  - [src/modules/auto-join/AutoJoinEngine.ts](../../src/modules/auto-join/AutoJoinEngine.ts) - Add HvN matching logic
  - [src/modules/auto-join/AutoJoinUI.ts](../../src/modules/auto-join/AutoJoinUI.ts) - Add HvN checkbox and event handlers
- **Breaking changes**: None (additive change only)
- **User-facing changes**:
  - New "Humans Vs Nations" checkbox in Auto-Join panel
  - Ability to filter specifically for HvN games
  - HvN selection persists across sessions

## Technical Notes

### Why Pseudo-Mode?

HvN is technically a `playerTeams` configuration value (like Duos/Trios/Quads), not a distinct `gameMode` in the OpenFront.io API. However, treating it as a pseudo-mode in the UI provides better UX:

- **User mental model**: Players think of HvN as a distinct game type, not a team configuration
- **Discoverability**: Top-level checkbox is more visible than nested team option
- **Simplicity**: No configuration complexity (unlike Team mode which has team count and player filters)

### Matching Logic

When HvN criteria is active, the matching engine checks:
```typescript
lobby.gameConfig?.gameMode === "Team"
  && lobby.gameConfig?.playerTeams === "Humans Vs Nations"
```

This ensures:
- HvN criteria only matches true HvN lobbies
- Regular Team criteria won't match HvN (unless user explicitly checks both Team and HvN)
- No player count filtering for HvN (per requirements)

### Settings Storage

HvN criteria stored in existing `criteriaList` array:
```typescript
{
  gameMode: 'HvN',
  teamCount: null,
  minPlayers: null,
  maxPlayers: null
}
```

No new storage keys required. Fully compatible with existing settings migration logic.
