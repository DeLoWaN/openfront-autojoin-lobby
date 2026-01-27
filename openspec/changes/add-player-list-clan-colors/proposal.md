# Change: Player list clan colors

## Why
Busy lobbies are harder to scan when every clan group uses the same styling. Distinct clan colors improve readability and should match OpenFront's team assignment and palette so clans that will play together share a color.

## What Changes
- Replicate OpenFront team assignment in the lobby preview so clans that end up on the same team share the same color
- Use OpenFront's team palette logic (base team colors and extended palette for Team 1..N) for exact color matching
- Apply clan/team color accents to clan headers and player pills for better visual grouping
- Replace the current-player-clan blue highlight with a lighter cue that keeps the clan's assigned team color

## Impact
- Affected specs: player-list
- Affected code: src/modules/player-list/PlayerListUI.ts, src/modules/player-list/PlayerListHelpers.ts, src/styles/styles.ts, src/config/theme.ts (or new config file)
- External reference: OpenFrontIO `TeamAssignment`, `LobbyPlayerView.getTeamList`, `ColorAllocator`, `Colors`
