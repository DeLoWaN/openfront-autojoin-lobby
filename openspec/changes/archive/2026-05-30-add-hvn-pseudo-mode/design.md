# Design: Humans Vs Nations Pseudo-Mode

## Context

The userscript's Auto-Join system currently supports two game mode filters: FFA and Team. OpenFront.io v0.29.0+ includes "Humans Vs Nations" (HvN) as a team configuration option, represented in the API as `gameMode: "Team"` with `playerTeams: "Humans Vs Nations"`. Users need the ability to specifically filter for and auto-join HvN games.

## Goals / Non-Goals

- Goals:
  - Add HvN as a top-level selectable mode in the Auto-Join UI
  - Enable specific filtering for HvN games (excluding other Team modes)
  - Maintain architectural consistency with OpenFront.io's data model
  - Preserve all existing functionality and settings
  - No player count filtering for HvN (per user requirements)
- Non-Goals:
  - Changes to player list display for HvN games
  - Custom notification text or sounds for HvN
  - Internationalization/translation support
  - Mobile-specific UI adjustments

## Decisions

### Architectural Decision: Pseudo-Mode Pattern

**Decision**: Implement HvN as a "pseudo-mode" - a top-level UI element that internally creates Team mode criteria with specific constraints.

**Rationale**:
1. **User Mental Model**: Players perceive HvN as a distinct game type, not a team configuration detail
2. **API Reality**: OpenFront.io represents HvN as `gameMode: "Team"` + `playerTeams: "Humans Vs Nations"`
3. **UX Discoverability**: Top-level checkbox is more visible than nested team option
4. **Simplicity**: No configuration UI needed (unlike Team mode with its team count and player filters)

**Implementation**:
- UI layer: HvN appears as a peer checkbox to FFA and Team
- Criteria layer: HvN creates `{gameMode: 'HvN', ...}` criteria object
- Matching layer: HvN criteria matches lobbies where `gameMode === "Team"` AND `playerTeams === "Humans Vs Nations"`

### Type System Extension

**Decision**: Extend `gameMode` type to `'FFA' | 'Team' | 'HvN'` in `AutoJoinCriteria` interface.

**Rationale**:
- Maintains type safety throughout the codebase
- Allows criteria to explicitly represent HvN intent
- TypeScript compiler catches missing HvN cases in switch statements

**Trade-off**: This introduces a semantic distinction (UI game mode) different from the API game mode, but the clarity benefit outweighs the conceptual mismatch.

### Matching Logic Strategy

**Decision**: Add dedicated HvN branch in matching engine that checks both `gameMode` and `playerTeams` fields.

**Implementation**:
```typescript
if (criteria.gameMode === 'HvN') {
  if (lobbyMode === 'Team' && lobby.gameConfig?.playerTeams === 'Humans Vs Nations') {
    matches = true;
    // No capacity checks for HvN
  }
}
```

**Rationale**:
- Clear separation of concerns: each game mode has its own matching logic
- Explicit check for "Humans Vs Nations" string prevents false positives
- Skipping capacity checks honors user requirement of "no criteria"

### UI Placement Decision

**Decision**: Position HvN checkbox as a third card after the Team config section, at the same visual hierarchy level as FFA and Team.

**Layout**:
```
┌─ FFA ─────────────┐
│  [capacity sliders]│
└───────────────────┘
┌─ Team ────────────┐
│  [team options]   │
│  [player filters] │
└───────────────────┘
┌─ Humans Vs Nations ┐  ← NEW
│  (no config)       │
└───────────────────┘
```

**Rationale**:
- Logical flow: FFA → Team → HvN (general to specific)
- Consistent visual pattern: all three use `.autojoin-mode-config` card styling
- No nested relationship implies these are selectable independently

### Settings Storage Strategy

**Decision**: Store HvN criteria in existing `criteriaList` array with `gameMode: 'HvN'`.

**Format**:
```typescript
{
  gameMode: 'HvN',
  teamCount: null,    // Not used for HvN matching
  minPlayers: null,   // No filtering
  maxPlayers: null    // No filtering
}
```

**Rationale**:
- No new storage keys required
- Backward compatible: older versions will ignore unknown `gameMode` values
- Forward compatible: adding new modes follows same pattern

## Alternatives Considered

### Alternative 1: HvN as Team Configuration Option

**Approach**: Add "Humans Vs Nations" checkbox alongside Duos/Trios/Quads in the Team mode section.

**Rejected because**:
- Requires Team checkbox to be enabled to select HvN
- Less discoverable (nested under Team)
- Inconsistent with user's request to add HvN "along with FFA and Teams"

### Alternative 2: HvN as Third True Game Mode

**Approach**: Treat HvN as fully distinct from Team mode at all layers, including matching engine.

**Rejected because**:
- Contradicts OpenFront.io API where HvN uses `gameMode: "Team"`
- Would require translation/mapping layer between UI and API
- Increases complexity without UX benefit

### Alternative 3: Hybrid "Quick Select" Button

**Approach**: Add HvN as a quick-select button that automatically checks Team + specific team count.

**Rejected because**:
- Hidden state changes confuse users (why did Team checkbox auto-enable?)
- Difficult to represent in settings (is Team "really" enabled?)
- Unclear UX: what happens if user then unchecks Team?

## Risks / Trade-offs

### Risk 1: Semantic Mismatch Between UI and API

**Issue**: UI shows three "game modes" (FFA, Team, HvN), but API only has two (`gameMode: "Free For All" | "Team"`).

**Mitigation**:
- Clear code comments explaining the pseudo-mode pattern
- Matching engine explicitly handles the translation
- Type system enforces correct handling at compile time

**Trade-off Accepted**: The UX clarity benefit outweighs the conceptual complexity.

### Risk 2: User Checks Both Team and HvN

**Issue**: If user checks both Team and HvN, they'll match HvN lobbies twice (once for each criteria).

**Mitigation**:
- Not a functional problem (matching engine returns true on first match)
- Could add UI hint: "Note: HvN is a type of Team game"
- For v1, accept this as low-priority issue

**Trade-off Accepted**: Independence of checkboxes is more valuable than preventing redundant criteria.

### Risk 3: OpenFront.io Changes HvN Representation

**Issue**: If OpenFront.io changes how HvN is represented in the API (e.g., adds a distinct `gameMode` value), the matching logic will break.

**Mitigation**:
- Centralize HvN detection in helper functions
- Single point of change if API evolves
- Monitor OpenFront.io release notes

**Likelihood**: Low (stable API patterns)

### Risk 4: Missing `playerTeams` Field

**Issue**: Older lobbies or API responses might not include `playerTeams` field.

**Mitigation**:
- Use optional chaining: `lobby.gameConfig?.playerTeams`
- If field is missing, HvN criteria won't match (safe failure)
- Defensive coding: check for exact string match

**Trade-off Accepted**: Graceful degradation is acceptable.

## Migration Plan

1. **Phase 1 - Types**: Update `AutoJoinTypes.ts` to extend game mode union
2. **Phase 2 - Helpers**: Add HvN detection and normalization functions
3. **Phase 3 - Engine**: Add HvN matching branch with playerTeams check
4. **Phase 4 - UI HTML**: Add HvN checkbox to panel structure
5. **Phase 5 - UI Logic**: Wire up criteria building, settings loading, event handlers
6. **Phase 6 - Validation**: Manual testing with HvN lobbies in OpenFront.io

Each phase is independently testable and can be committed separately.

## Open Questions

- **Q**: Should we add a tooltip/hint explaining that HvN is a type of Team game?
  - **A**: Not for v1. Keep UI minimal. Can add in future if users express confusion.

- **Q**: Should HvN selection disable Team checkbox or vice versa?
  - **A**: No. Allow independent selection. Users can choose to match "any Team game" + "specifically HvN" if they want.

- **Q**: Should we add player count filtering for HvN later?
  - **A**: User explicitly specified "no criteria" for HvN. Do not add filtering unless requested.

## Success Metrics

- ✅ HvN checkbox appears in UI after Team section
- ✅ Checking HvN creates criteria with `gameMode: 'HvN'`
- ✅ HvN criteria matches lobbies with `playerTeams: "Humans Vs Nations"`
- ✅ HvN criteria does NOT match Duos/Trios/Quads/numeric team lobbies
- ✅ HvN settings persist across page refreshes
- ✅ TypeScript compilation passes with strict mode
- ✅ No regression in existing FFA/Team functionality
