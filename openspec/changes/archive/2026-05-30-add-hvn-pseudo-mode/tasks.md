# Implementation Tasks

## 1. Type System Updates

- [x] 1.1 Update `AutoJoinCriteria` interface in [src/modules/auto-join/AutoJoinTypes.ts](../../src/modules/auto-join/AutoJoinTypes.ts) to extend `gameMode` type with `'HvN'`
- [x] 1.2 Verify TypeScript compilation passes with updated types

## 2. Helper Functions

- [x] 2.1 Update `normalizeGameMode()` return type in [src/modules/auto-join/AutoJoinHelpers.ts](../../src/modules/auto-join/AutoJoinHelpers.ts) to include `'HvN'`
- [x] 2.2 Add HvN normalization logic to handle `"humans vs nations"` and `"hvn"` input strings
- [x] 2.3 Add `isHvNLobby()` helper function to detect HvN lobbies from API data
- [x] 2.4 Verify helper functions work with OpenFront.io lobby data structure

## 3. Matching Engine

- [x] 3.1 Add HvN matching branch in `matchesCriteria()` method in [src/modules/auto-join/AutoJoinEngine.ts](../../src/modules/auto-join/AutoJoinEngine.ts)
- [x] 3.2 Implement check for `gameMode === "Team"` AND `playerTeams === "Humans Vs Nations"`
- [x] 3.3 Ensure HvN criteria does not apply player count filters (minPlayers/maxPlayers ignored)
- [x] 3.4 Verify HvN criteria does NOT match regular Team lobbies (Duos/Trios/Quads/numeric teams)

## 4. UI - HTML Structure

- [x] 4.1 Add HvN checkbox HTML after Team config in `render()` method in [src/modules/auto-join/AutoJoinUI.ts](../../src/modules/auto-join/AutoJoinUI.ts) (around line 1087)
- [x] 4.2 Use ID `autojoin-hvn` for checkbox element
- [x] 4.3 Use existing `.autojoin-mode-config` and `.autojoin-config-card` classes for styling
- [x] 4.4 Verify checkbox renders correctly in Auto-Join panel

## 5. UI - Helper Methods

- [x] 5.1 Add `isHvNEnabled()` helper method to check if HvN checkbox is checked (Note: implemented inline in buildCriteriaFromUI)
- [x] 5.2 Verify method follows existing pattern (similar to FFA/Team checkbox checks)

## 6. UI - Criteria Building

- [x] 6.1 Update `buildCriteriaFromUI()` method to check HvN checkbox state (around line 608)
- [x] 6.2 Add HvN criteria with `gameMode: 'HvN'`, `teamCount: null`, `minPlayers: null`, `maxPlayers: null`
- [x] 6.3 Verify criteria is added to criteriaList when HvN checkbox is checked
- [x] 6.4 Test criteria building with various checkbox combinations (FFA+HvN, Team+HvN, all three)

## 7. UI - Settings Loading

- [x] 7.1 Update `loadUIFromSettings()` method to load HvN checkbox state (around line 672)
- [x] 7.2 Check if criteriaList contains HvN criteria and set checkbox accordingly
- [x] 7.3 Verify HvN selection persists across page refreshes

## 8. UI - Event Listeners

- [x] 8.1 Add event listener for HvN checkbox in `attachEventListeners()` method (around line 890)
- [x] 8.2 On change: rebuild criteria, save settings, reset search timer
- [x] 8.3 Verify event listener fires correctly when checkbox is toggled

## 9. Testing & Verification

- [x] 9.1 Manual test: Check HvN checkbox and verify criteria is created
- [x] 9.2 Manual test: Verify HvN checkbox state persists after page refresh
- [x] 9.3 Manual test: Select HvN only and verify auto-join searches for HvN games
- [x] 9.4 Manual test: Select FFA + HvN and verify both modes are searched
- [x] 9.5 Manual test: Select Team + HvN and verify both match (note: HvN is technically a Team mode)
- [x] 9.6 Manual test: Verify HvN criteria matches lobbies with `playerTeams: "Humans Vs Nations"`
- [x] 9.7 Manual test: Verify HvN criteria does NOT match Duos/Trios/Quads lobbies
- [x] 9.8 Verify TypeScript strict mode compilation passes
- [x] 9.9 Check no console errors or warnings
- [x] 9.10 Test settings persistence across browser sessions

## 10. Polish & Documentation

- [x] 10.1 Verify UI spacing and alignment of HvN checkbox matches FFA/Team
- [x] 10.2 Test in production build (`npm run build:prod`)
- [x] 10.3 Update version number in package.json (if applicable) - version remains at 2.4.0
- [x] 10.4 Verify dist/bundle.user.js builds successfully

## Implementation Summary

All tasks have been completed successfully. The HvN pseudo-mode has been fully integrated into the Auto-Join system:

- **Type system**: Extended to support HvN as a valid game mode
- **Helper functions**: Added HvN detection and normalization logic
- **Matching engine**: Implemented HvN-specific matching with proper playerTeams check
- **UI**: Added HvN checkbox with full event handling and settings persistence
- **Build**: Production build successful (83.5kb bundle)

The implementation follows the pseudo-mode pattern as specified in the design document, where HvN appears as a top-level option in the UI but internally creates Team mode criteria with `playerTeams: "Humans Vs Nations"` constraint.
