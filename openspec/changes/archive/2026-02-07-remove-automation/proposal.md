## Why

OpenFront TOS compliance requires removing automated actions that perform lobby joins/rejoins on behalf of the player. The script should still provide informational notifications so players can discover matching lobbies and join manually.

## What Changes

- **BREAKING** Remove all join-executing automation:
  - Criteria-based auto-join that directly joins a lobby
  - Clanmate watcher one-shot auto-join
  - Auto-rejoin on clan tag apply
- Preserve notification-based discovery (including game-found alerts), but require an explicit player action to join every lobby.
- Keep Team criteria configuration for manual discovery filtering.
- **BREAKING** Remove UI controls and persisted settings that only exist to trigger automated join/rejoin actions.
- Remove unused mode selectors for `FFA` and `Humans Vs Nations` and their related criteria parsing/normalization logic.
- **BREAKING** Rename panel/class/file naming away from auto-join terminology so UX and code identifiers reflect notification-first manual joining.

## Capabilities

### New Capabilities
- `manual-join-only-lobby-assist`: The userscript must never automatically join, rejoin, or switch lobbies; every join must come from explicit user interaction.
- `notification-based-lobby-discovery`: Matching-lobby notifications remain available to help users find games without performing join actions, while keeping Team criteria filtering.
- `mode-selector-pruning`: Unused mode selectors (`FFA`, `Humans Vs Nations`) and associated logic must be removed.
- `notification-terminology-rename`: User-facing text, DOM identifiers/classes, and module/file naming must move from auto-join terminology to notification/manual-discovery terminology.

### Modified Capabilities
- None.

## Impact

- Affected source areas include `src/modules/auto-join/*` (remove join-executing paths, keep notify paths), `src/modules/player-list/PlayerListUI.ts` (remove auto-rejoin behavior), `src/styles/styles.ts` (remove automation-only controls), `src/main.ts` (module wiring updates), and `src/config/constants.ts` (remove obsolete automation storage keys while preserving needed notify settings).
- Tests will need updates to assert that no automatic join/rejoin occurs while notification flows continue to function.
- Bundle/docs outputs will need refresh (`dist/bundle.user.js`, README/OpenSpec docs) to reflect manual-join-only behavior.
