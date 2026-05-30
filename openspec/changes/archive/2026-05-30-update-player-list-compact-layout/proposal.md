# Change: Update Player List to Compact Horizontal Layout

## Why

The current player list displays players in a vertical layout with one player per line. For players within clan groups, this redundantly shows the clan tag twice: once in the group header `[TAG]` and again in each player's name `[TAG] PlayerName`. This wastes vertical space and limits how many players can be viewed at once.

By removing redundant clan tags and arranging players horizontally within clan groups, we can display significantly more players simultaneously while improving visual clarity.

## What Changes

- **Remove redundant clan tags**: Strip `[TAG]` prefix from player names when displayed within clan group sections
- **Horizontal layout for clan groups**: Transform clan group player display from vertical (one-per-line) to horizontal flex with wrapping
- **Box/pill visual style**: Display each username in a small box/pill to visually separate players
- **Preserve untagged players**: Keep vertical layout for players without clan tags
- **Maintain all existing functionality**: Animations, highlighting, hover states, and interactivity remain unchanged

## Impact

- **Affected specs**: `player-list`
- **Affected code**:
  - [src/modules/player-list/PlayerListHelpers.ts](../../src/modules/player-list/PlayerListHelpers.ts) - Add `stripClanTag()` helper
  - [src/modules/player-list/PlayerListUI.ts](../../src/modules/player-list/PlayerListUI.ts) - Modify `createPlayerEl()` signature and call sites
  - [src/styles/styles.ts](../../src/styles/styles.ts) - Update CSS for horizontal layout and pill styling
- **Breaking changes**: None
- **User-facing changes**: Visual layout improvement, better space efficiency
