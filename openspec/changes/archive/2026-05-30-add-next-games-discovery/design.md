## Context

The lobby feed (`game-mode-selector.lobbies.games`) carries, per source (`ffa`/`team`/`special`), exactly two entries: `[0]` the live filling lobby and `[1]` the next queued game. `LobbyDataManager.extractLobbies` already flattens **all** entries into the snapshot array, so the data reaches `LobbyDiscoveryUI` today. `processLobbies` then deliberately keeps only the *featured* (`[0]`) lobby per source, because the original rationale was "clicking a native card joins `[0]`, so a hidden `[1]` match isn't actionable."

Two live-verified facts reshape that rationale:
1. The `[1]` game has **no `startsAt`** — there is genuinely no countdown to display until it is promoted to live.
2. The `[1]` game **is reachable**: navigating to `/game/<gameID>` auto-resolves the worker (`/wN/game/<id>`) and opens OpenFront's native join-lobby modal. So `[1]` *is* actionable — just not via the native card.

This change surfaces `[1]`, extends notifications to it, and makes it joinable, while honoring the project's manual-join guardrails.

## Goals / Non-Goals

**Goals**
- Show one upcoming card per slot, column-aligned beneath the native grid, unmistakably "not live."
- Reuse the existing matching engine verbatim; only widen *which* lobbies are evaluated.
- Notify on upcoming matches identically to live matches, behind a default-on toggle.
- Offer user-initiated quick-join navigation without any automated join.

**Non-Goals**
- No countdown/ETA estimation for upcoming games (the data doesn't exist; estimating is fragile).
- No support for more than one upcoming game per slot (the feed only provides `[1]`).
- No changes to `LobbyDataManager` or the data pipeline.
- No automated join, rejoin, or background navigation of any kind.

## Decisions

### D1: Mount the Up Next strip as our own element, not inside OpenFront's grid
The native grid is Lit-rendered and uses `nothing` for absent slots (see `getQueueCardElements`, which finds columns by class rather than position to survive re-renders). Injecting cards *into* that grid risks being wiped on re-render and fighting responsive classes. Instead, mount a script-owned container immediately **after** the `game-mode-selector` grid, using a `MutationObserver`/re-apply pattern consistent with the existing pulse-sync approach. We reproduce the native 2fr/1fr layout ourselves so cards still align under their live counterparts.
- *Alternative considered:* inject attached ghost cards into the native columns. Rejected: fragile against Lit re-renders, tight space, responsive breakage.

### D2: Widen matching scope per-slot, keep dedup keyed by gameID
`processLobbies` currently early-continues on `!isFeaturedForSource`. We instead evaluate both `[0]` and `[1]` per source. The notification key already includes `gameID`, so live vs upcoming for the same slot dedupe independently. A new gate (`notifyUpcomingEnabled`) suppresses upcoming matches' notifications/sound when off — but the strip itself still renders (display is independent of notify).
- *Alternative considered:* a separate engine path for upcoming. Rejected: the engine is pure and config-driven; no behavioral difference is wanted, so reuse as-is.

### D3: No countdown — render "Up next" + capacity
Because `[1]` has no `startsAt`, the timer slot shows a static "Up next" chip and the card shows capacity (`maxPlayers`) rather than `num/max` filling progress (it's empty until promoted). This is the single most important honesty constraint.

### D4: Click-to-join = `location.assign('/game/' + gameID)`, user-gesture only
The card's click handler navigates to the game URL; OpenFront's router opens its join modal; the user still confirms entry there. This is invoked **only** from a real click event — never from matching, watchers, or timers — preserving the manual-join guardrail. Live cards remain OpenFront's own; we only add navigation for the otherwise-unreachable upcoming game.
- *Alternative considered:* simulate a click on a native control. Rejected: there is no native control for `[1]`, and click-simulation is explicitly disallowed.
- *Implementation refinement:* there is **no bespoke "Join" button**. The whole card is the click target and scales on hover exactly like OpenFront's native lobby cards, so the affordance is already familiar; the manual-join intent is preserved for assistive tech via an `aria-label` ("Open *map* in OpenFront's join modal"). The click navigation deep-links to `/game/<id>`, which is a full-page navigation, so the userscript's `@match` was broadened to `https://openfront.io/*` to keep the script loaded on the resulting `/wN/game/<id>` page (where the current-player highlighter runs and lobby discovery sleeps via `isOnLobbyPage()`).

### D5: Notify on upcoming = identical pulse + sound (per product decision)
An upcoming match reuses the same active-card visual treatment and `SoundUtils.playGameFoundSound`. The card's permanent "not live" styling (dimmed art, dashed border, "Up next" chip) is what distinguishes it; the *alert* itself is intentionally not differentiated.

### D6: Settings — one new boolean, backwards compatible
Add `notifyUpcomingEnabled?: boolean` to `LobbyDiscoverySettings`, defaulted to `true` in `normalizeSettings` when absent (existing storage key reused). No migration needed; older saved settings simply gain the default.

### D6b: Card layout sizes to content; mode label mirrors OpenFront
The card is a flex column with `justify-content: space-between`: tags flow at the top, the name bar is pinned to the bottom, and the card **grows to fit** its tags (`min-height` floor only) so up to three stacked modifiers never overlap the map name. Slots are content-sized (no equal-height `flex: 1`), which avoids clipping the taller of two stacked right-column cards. The mode/format line reuses OpenFront's own `getLobbyTitle` wording — "**{n} teams of {playersPerTeam}**" for Duos/Trios/Quads and numeric team counts (e.g. "10 teams of 4"), and "{n} Humans vs {n} Nations" for HvN — rather than the named "Duos/Trios/Quads" labels, so the upcoming card reads identically to the live cards. A render-signature cache skips rebuilding unchanged slots on each refresh, preventing hover flicker.

### D7: Reconcile guardrail wording
`manual-join-only-lobby-assist` is updated to explicitly permit user-initiated navigation to the join modal while keeping automated-join prohibited and final entry behind OpenFront's confirm. The panel eyebrow changes to convey manual quick-join without the word "auto-join", satisfying `notification-terminology-rename`.

## Risks / Trade-offs

- **[Lit re-render wipes the strip]** → Mount outside the native grid and re-apply via the existing observer/timeout sync pattern already used for pulses.
- **[Users read click-to-join as "the script joins for me"]** → Card navigates to the *modal* only; user confirms in OpenFront. The card behaves like a native lobby card (click to open), the eyebrow says "quick-join · never auto-joins", and the `aria-label` names the action as opening the join modal — no "auto-join" wording anywhere.
- **[Perceived contradiction with "notify-only" identity]** → Addressed head-on via spec + copy updates; "never auto-joins" remains literally true and tested.
- **[`[1]` absent for a slot]** → Render an explicit "No upcoming game" placeholder; never assume presence.
- **[Map thumbnail for an upcoming map not yet cached]** → Use the same `<img>` source OpenFront uses; broken-image fallback degrades to the dimmed card background.

## Migration Plan

Pure additive runtime behavior; no data migration. Rollback = revert the change; the new settings field is ignored by prior versions and re-defaulted by `normalizeSettings`.

## Resolved Questions

- **Final eyebrow copy:** "Notify + quick-join · never auto-joins" — conveys manual quick-join without auto-join language, satisfying `notification-terminology-rename`.
