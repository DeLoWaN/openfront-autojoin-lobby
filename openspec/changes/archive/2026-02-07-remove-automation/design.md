## Context

The current implementation mixes two concerns in `src/modules/auto-join/*`: (1) lobby discovery and notification, and (2) join execution automation. Automation currently occurs through three paths:

1. Criteria-based auto-join via `AutoJoinUI.processLobbies()` -> `joinLobby()` -> `LobbyUtils.tryJoinLobby()`.
2. Clanmate one-shot watcher via `AutoJoinUI.handleClanmateUpdate()` -> `attemptClanmateJoin()` -> `LobbyUtils.tryJoinLobby()`.
3. Clan-tag apply rejoin via `PlayerListUI.applyClanTagToNickname()` -> `performLobbyRejoin()`.

Your clarified requirement is to preserve informational notifications but eliminate any script behavior that performs join/rejoin actions that would otherwise be user clicks in native UI. The same area also contains unused mode selectors (`FFA`, `Humans Vs Nations`) that should be removed.

## Goals / Non-Goals

**Goals:**
- Guarantee the userscript never triggers lobby join/rejoin/switch actions programmatically.
- Keep notification-based lobby discovery (including sound alerts) for manual user decisions.
- Keep Team criteria configuration for notification discovery filtering.
- Remove `FFA` and `Humans Vs Nations` selectors and associated criteria logic.
- Remove automation-only state, controls, and storage fields.
- Rename panel/class/file terminology from auto-join semantics to notification/manual-discovery semantics.
- Keep the change compatible with existing lobby data flow and UI architecture.

**Non-Goals:**
- Redesigning player list behavior unrelated to auto-rejoin.
- Reworking lobby transport (WebSocket/HTTP fallback).
- Adding new gameplay features.
- Changing OpenFront native join UX.

## Decisions

### 1. Enforce a strict "no programmatic join/rejoin" rule in code

Decision:
- Remove all direct calls that execute join/rejoin actions:
  - `AutoJoinUI.joinLobby()` and `attemptClanmateJoin()` behavior
  - `PlayerListUI.performLobbyRejoin()` usage on clan tag apply
- Remove clanmate watcher wiring from `main.ts` and related callback plumbing if no longer needed.

Rationale:
- Compliance needs to be mechanically enforceable, not mode-dependent.
- As long as `LobbyUtils.tryJoinLobby()` remains reachable from background/state-driven flows, accidental regressions are likely.

Alternatives considered:
- Keep code but gate with a config flag: rejected because it preserves a latent automation path and increases compliance risk.
- Keep clanmate one-shot as "semi-manual": rejected because it still replaces native join clicks.

### 2. Keep discovery/notification capability, but make it notify-only

Decision:
- Retain lobby matching and notification rendering/sound.
- Convert UI language and state model from auto-join semantics to notification semantics.
- Keep enable/disable control only for discovery notifications (not for joining behavior).

Rationale:
- Meets user requirement to keep notifications while removing automated action.
- Minimizes churn by preserving existing data subscription and notification components.

Alternatives considered:
- Delete entire auto-join module and build a new module: rejected for unnecessary risk/churn.
- Keep existing "autojoin vs notify" mode toggle and force notify internally: rejected because it leaves misleading UX and dead paths.

### 3. Prune unused modes (`FFA`, `Humans Vs Nations`) from model, engine, and UI

Decision:
- Remove FFA/HvN selectors from UI and remove associated criteria branches from:
  - `AutoJoinTypes` union types
  - `AutoJoinHelpers.normalizeGameMode()` public matching surface where no longer needed for filtering
  - `AutoJoinEngine.matchesCriteria()` branches for FFA/HvN
- Keep Team criteria filtering paths (team count and player-per-team constraints).

Rationale:
- Reduces complexity and prevents stale filters from affecting discovery behavior.
- Aligns UI with actually supported workflow.

Alternatives considered:
- Hide selectors but keep logic/data model: rejected because dead behavior remains and increases maintenance burden.

### 4. Rename module/UI terminology to notification-first naming

Decision:
- Rename `auto-join` naming across panel title, visible labels, DOM IDs/classes, logs, and module/class/file names to notification/manual-discovery terminology.
- Apply renames as a coordinated refactor so wiring/imports/styles remain coherent.

Rationale:
- Terminology should reflect the post-change behavior and avoid implying automated joining.
- Naming consistency reduces confusion for future maintenance and feature work.

Alternatives considered:
- Keep legacy names for low-risk refactor: rejected because it preserves misleading semantics after automation removal.

### 5. Migrate persistence away from automation-specific fields

Decision:
- Remove or ignore persisted fields used only by join automation (e.g., `joinMode`, `autoRejoinOnClanChange`, clanmate armed state).
- Retain persisted values that still matter (e.g., notification enabled state, sound, supported criteria).
- On load, sanitize legacy saved criteria by dropping removed modes so old settings cannot re-enable deprecated paths.

Rationale:
- Prevents stale storage from reintroducing unsupported behavior.
- Preserves useful user preferences where behavior remains valid.

Alternatives considered:
- Full key reset/mass wipe of stored settings: rejected because it discards useful preferences and creates unnecessary UX friction.

## Risks / Trade-offs

- [Risk] UI/wording still implies automation in some labels/classes/logs.
  → Mitigation: update visible labels and key log messages in the same change; add review checklist for user-facing strings.

- [Risk] Legacy settings with FFA/HvN or autojoin mode produce unexpected notify behavior.
  → Mitigation: sanitize loaded settings and add unit tests for legacy migration inputs.

- [Risk] Removing clanmate callback path can leave dead interface methods or compile errors across modules.
  → Mitigation: update `main.ts` wiring and remove/adjust callback contracts in both modules within one atomic refactor.

- [Risk] Behavior regressions in notification timer/status after removing mode toggle logic.
  → Mitigation: add tests for notify lifecycle (idle -> searching -> found -> reset).

- [Risk] Renaming files/classes/DOM selectors causes mismatches with CSS or imports.
  → Mitigation: perform renames in one pass with search-based verification and run type-check/tests after refactor.

## Migration Plan

1. Refactor `AutoJoinUI` into notify-only behavior:
- Remove join execution code paths and clanmate auto-join behavior.
- Remove autojoin/notify mode toggle logic.
- Keep discovery matching + notification rendering + sound toggle.

2. Refactor criteria model and UI controls:
- Remove FFA/HvN selectors and related slider/state wiring.
- Keep Team criteria filtering and sanitize persisted legacy criteria.

3. Remove player-list auto-rejoin:
- Delete `getAutoRejoinOnClanChange()` + `performLobbyRejoin()` usage from clan tag apply flow.
- Remove auto-rejoin toggle control from UI where exposed.

4. Rename terminology across UI and code:
- Rename panel strings, DOM IDs/classes, and logs from auto-join wording.
- Rename module/class/file paths and imports to notification/manual-discovery naming.

5. Clean storage constants and migrations:
- Drop automation-only fields and legacy migrations tied to them.
- Keep backward-safe reads for still-supported settings where needed.

6. Update tests and documentation:
- Add/adjust tests to assert no automatic join/rejoin occurs.
- Update docs and bundle messaging to manual-join-only language.

Rollback strategy:
- Revert this change set as a unit if notification behavior breaks. No backend/data migrations are irreversible because storage changes are client-side and can be re-read with fallback defaults.

## Open Questions

None.
