## 1. Rename Discovery Module and Wiring

- [ ] 1.1 Rename `src/modules/auto-join/` files/classes/symbols to notification/manual-discovery naming and update all imports/usages in `src/main.ts`.
- [ ] 1.2 Rename discovery-related DOM IDs/classes and style selectors from auto-join prefixes to notification-oriented prefixes across `src/modules/*` and `src/styles/styles.ts`.
- [ ] 1.3 Update user-facing panel copy, control labels, and logs to notification/manual-join wording (remove "Auto-Join" language).

## 2. Remove Programmatic Join/Rejoin Behavior

- [ ] 2.1 Remove criteria-driven join execution paths (including any calls that invoke `LobbyUtils.tryJoinLobby()` from discovery loops).
- [ ] 2.2 Remove clanmate one-shot join watcher behavior and its cross-module callback plumbing.
- [ ] 2.3 Remove clan-tag apply auto-rejoin flow in `src/modules/player-list/PlayerListUI.ts` so tag apply updates inputs only.
- [ ] 2.4 Remove UI controls that exist only for automated join/rejoin actions.

## 3. Keep Notify-Only Discovery with Team Criteria

- [ ] 3.1 Preserve matching-lobby notification flow, including deduplication and game-found display behavior.
- [ ] 3.2 Keep Team criteria configuration (team formats and players-per-team range) and ensure discovery matching still evaluates those constraints.
- [ ] 3.3 Preserve notification enable/disable and sound toggles for persisted notify-only behavior.

## 4. Prune Removed Modes and Sanitize Settings

- [ ] 4.1 Remove `FFA` and `Humans Vs Nations` selectors from discovery UI markup and event wiring.
- [ ] 4.2 Remove FFA/HvN criteria branches and related unions/helpers in discovery types and matching logic.
- [ ] 4.3 Sanitize persisted legacy criteria so removed modes are dropped on load while valid Team criteria are preserved.
- [ ] 4.4 Remove or ignore automation-only persisted fields/migrations while keeping backward-safe defaults for remaining notify settings.

## 5. Update Tests and Add Regression Coverage

- [ ] 5.1 Add/extend tests for discovery matching and settings sanitization to verify Team-only criteria behavior and removed-mode cleanup.
- [ ] 5.2 Add tests that assert no automated join/rejoin path is triggered by lobby updates, clanmate updates, or clan-tag apply actions.
- [ ] 5.3 Add tests that verify notification behavior remains functional (notification trigger, dedupe, and sound-toggle handling).

## 6. Documentation and Release Validation

- [ ] 6.1 Update README and OpenSpec change docs to describe notification/manual-discovery behavior and removed automation.
- [ ] 6.2 Run `npm run type-check` and `npm test` and resolve issues.
- [ ] 6.3 Build and verify bundle output with `npm run build:prod`.
