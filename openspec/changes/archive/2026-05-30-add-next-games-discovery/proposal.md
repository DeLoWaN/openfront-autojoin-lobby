## Why

OpenFront's lobby feed already delivers the *next* game queued for each slot (`games[source][1]`), but the userscript discards it and the native UI never shows it. Players can't see — or get notified about — a matching game until it's the live, filling lobby, even though that upcoming game already exists and is joinable by ID. Surfacing it lets users spot and pre-join a matching game one rotation early.

## What Changes

- Add an **"Up Next" strip** beneath OpenFront's native lobby grid, showing each slot's upcoming game (`[1]`) with all available config: map art, mode, team format, capacity, and modifiers.
- Upcoming cards are clearly **not-live**: dimmed/grayscaled art, dashed border, an "Up next" chip where the countdown sits, and **no timer** (the feed assigns `startsAt` only when a game goes live).
- Extend discovery matching/notifications to upcoming games: a match **pulses and plays sound identically to a live match**, gated by a new **"Notify on upcoming games"** toggle (default ON).
- Make upcoming cards **clickable to join** via user-initiated navigation to `/game/<gameID>`, which opens OpenFront's own join modal. The script still never joins on its own and final lobby entry still requires OpenFront's confirm control.
- Reword the panel eyebrow from "Notify only · never auto-joins" to reflect the new manual quick-join affordance, without introducing auto-join language.
- Strip respects existing sleep gating (hidden during live games / off the lobby page) and shows "No upcoming game" when a slot has no `[1]`.

## Capabilities

### New Capabilities
- `upcoming-games-display`: Presenting each lobby slot's upcoming game as a non-live, clearly-distinguished card with full configuration, an absent-slot fallback, and a user toggle — without ever fabricating a countdown.

### Modified Capabilities
- `notification-based-lobby-discovery`: Discovery matching and notifications extend beyond the featured live lobby to include the upcoming game per slot when the toggle is enabled.
- `manual-join-only-lobby-assist`: Permit user-initiated navigation to OpenFront's join modal (deep-link to `/game/<gameID>`) from clicking a discovery card, while keeping the prohibition on background/automated/criteria-triggered join intact.
- `notification-terminology-rename`: Permit manual "quick-join" navigation language in user-facing copy alongside notification/manual-join terminology, still excluding auto-join wording.

## Impact

- **Source**: `src/modules/lobby-discovery/LobbyDiscoveryUI.ts` (matching scope, Up Next strip rendering, click-to-join, sleep gating, eyebrow copy), `LobbyDiscoveryTypes.ts` + `LobbyDiscoveryHelpers.ts` (new toggle + `normalizeSettings` default), `src/styles/styles.ts` (Up Next card styles).
- **Settings**: One new persisted field in `LobbyDiscoverySettings` (existing storage key reused; backwards compatible via `normalizeSettings`).
- **Behavior**: Reverses the current "featured-only" matching restriction for upcoming games; introduces the first user-initiated join-navigation affordance in the script (the whole card is clickable, native-style, with no dedicated "Join" button).
- **Userscript header**: `@match` broadened to `https://openfront.io/*` so the script stays loaded after a quick-join deep-link navigates to `/wN/game/<id>` (discovery sleeps in-game; the current-player highlighter runs in the join modal).
- **Docs**: `CLAUDE.md` notify-only framing updated to describe the manual quick-join affordance.
- **Tests**: New coverage for upcoming-game matching, toggle gating, no-countdown rendering, and absent-slot fallback.
