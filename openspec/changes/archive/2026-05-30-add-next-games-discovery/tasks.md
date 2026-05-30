## 1. Settings & types

- [x] 1.1 Add `notifyUpcomingEnabled?: boolean` to `LobbyDiscoverySettings` in `src/modules/lobby-discovery/LobbyDiscoveryTypes.ts`
- [x] 1.2 Default `notifyUpcomingEnabled` to `true` in `normalizeSettings` (`LobbyDiscoveryHelpers.ts`) when absent; load/save it in `LobbyDiscoveryUI` (`loadSettings`/`saveSettings`)
- [x] 1.3 Unit test: `normalizeSettings` returns `notifyUpcomingEnabled: true` for legacy settings missing the field, and preserves an explicit `false`

## 2. Matching scope (live + upcoming)

- [x] 2.1 In `processLobbies`, evaluate both the featured `[0]` and upcoming `[1]` lobby per source instead of skipping non-featured lobbies; tag each match as live or upcoming
- [x] 2.2 Gate upcoming-match notification + sound behind `notifyUpcomingEnabled`; keep dedup keyed by `gameID` so live and upcoming for the same slot dedupe independently
- [x] 2.3 Ensure an upcoming match uses the same highlight + `SoundUtils.playGameFoundSound` as a live match (notification parity)
- [x] 2.4 Unit test: an upcoming `[1]` lobby matching criteria triggers a notification when the toggle is on, and none when off; live behavior unchanged

## 3. Up Next strip rendering

- [x] 3.1 Build an Up Next card renderer (map art via OpenFront's thumbnail `<img>`, mode, team format, capacity, modifiers) following the not-live treatment (dimmed/grayscaled art, dashed border, "Up next" chip, no countdown)
- [x] 3.2 Mount a script-owned Up Next container immediately after the `game-mode-selector` grid, reproducing the native 2fr/1fr layout so each upcoming card aligns under its live slot; re-apply on Lit re-render using the existing observer/timeout sync pattern
- [x] 3.3 Render an explicit "No upcoming game" placeholder for any slot whose `[1]` is absent
- [x] 3.4 Add Up Next card styles to `src/styles/styles.ts` using existing theme tokens
- [x] 3.5 Unit test: upcoming card renders config without any countdown/timer; absent slot renders the fallback

## 4. Click-to-join (manual, user-gesture only)

- [x] 4.1 Add a click handler on upcoming cards that calls `location.assign('/game/' + gameID)`; wire it only to real user click events (never from matching/watchers/timers)
- [x] 4.2 Make the whole card the join affordance — native-style hover scale, no dedicated "Join" button — with an `aria-label` using manual-join language (no auto-join wording)
- [x] 4.3 Unit test: clicking an upcoming card navigates to the game URL; no navigation occurs from matching/processing without a click

## 5. Sleep gating & visibility

- [x] 5.1 Hide the Up Next area under the same conditions as the panel (`updateSleepState` / `isDiscoveryFeedbackAllowed`); show it on the lobby page when discovery is active
- [x] 5.2 Clean up the Up Next container and observers in `cleanup()`
- [x] 5.3 Unit test: Up Next area is hidden off the lobby page / during a live game and shown on the lobby page

## 6. Terminology & docs

- [x] 6.1 Reword the panel eyebrow from "Notify only · never auto-joins" to convey manual quick-join without auto-join language
- [x] 6.2 Update `CLAUDE.md` notify-only framing to describe the manual quick-join affordance (script still never auto-joins)

## 7. Verification

- [x] 7.1 Run `npm run type-check` and `npm test`; fix failures
- [x] 7.2 Run `npm run build:prod` and bump version per the version-management process
- [x] 7.3 Validate the live behavior against the mockup (`mockups/next-games.html`) and the real dashboard via Playwright MCP (upcoming cards render, match pulses, click opens the join modal)
