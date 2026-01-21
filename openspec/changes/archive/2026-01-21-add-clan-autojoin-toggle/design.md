## Context
Auto-join currently only reacts to lobby criteria, while the player list already observes the active lobby's player list and knows the user's clan tag. A new clan-based auto-join needs to piggyback on that player list feed and add new settings that are shared between the auto-join panel and player list behavior.

## Goals / Non-Goals
- Goals:
  - Auto-join the lobby when a clanmate appears in the player list after a one-shot action.
  - Move the auto-rejoin-on-clan-apply toggle into the auto-join panel and store it with auto-join settings.
  - Place auto-join status indicators alongside the sound toggle without compressing the main mode button.
- Non-Goals:
  - Change auto-join matching criteria or notify behavior beyond the clan-based trigger.
  - Add new external dependencies or services.

## Decisions
- Decision: Use a one-shot button that arms the clanmate watcher until the next match or invalid state, then resets.
- Decision: Detect clanmate presence using the same player list update flow that renders the panel, avoiding extra network calls.
- Decision: Store the auto-rejoin setting inside the auto-join settings object, with a migration from the legacy player-list key.
- Decision: Keep the clanmate watcher state in-memory (one-shot) rather than persisted settings.
- Decision: Keep join actions centralized through LobbyUtils.tryJoinLobby to preserve debouncing and state verification.
- Decision: Add a short UI hint clarifying the clanmate action is independent of the auto-join active/notify mode.

## Alternatives considered
- Fetch player lists per lobby in AutoJoinUI and match there (rejected: redundant requests and extra latency).
- Introduce a new data-layer "player list manager" for shared subscriptions (rejected: added complexity for a small feature).

## Risks / Trade-offs
- Using player list updates means clan auto-join only triggers when the lobby data is updated; mitigated by existing polling/WebSocket cadence.
- Moving settings storage requires migration; mitigated by copying legacy values on startup.

## Migration Plan
- On load, if the legacy player-list auto-rejoin key exists and auto-join settings lack the field, copy the value into auto-join settings without deleting the legacy key.

## Open Questions
- None
