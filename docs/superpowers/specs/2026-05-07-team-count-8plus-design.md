# Design: "8+" Team Count Filter

**Date:** 2026-05-07
**Scope:** Add an "8+" chip to the NUMBER OF TEAMS selector that matches any lobby with 8 or more teams.

---

## Problem

The NUMBER OF TEAMS chips currently go from 2 to 7. Lobbies with 8+ teams (e.g. "10 TEAMS OF 2") are always excluded when any numeric team-count filter is active, because the engine does an exact match.

## Design

### Type layer — `LobbyDiscoveryTypes.ts`

Add `'8+'` as a valid `TeamCount` literal:

```ts
export type TeamCount = 'Humans Vs Nations' | '8+' | number;
```

`Duos`, `Trios`, `Quads` are intentionally omitted — they were removed from the UI and `sanitizeCriteriaTeamCount` already strips them from saved settings. They remain in `parseTeamCount` only for parsing raw lobby data from OpenFront.

### Parsing / sanitization — `LobbyDiscoveryHelpers.ts`

- `parseTeamCount`: recognise the string `'8+'` and return it as-is.
- `sanitizeCriteriaTeamCount`: let `'8+'` pass through (currently only blocks `Duos/Trios/Quads`).

### Engine — `LobbyDiscoveryEngine.ts`

Replace the `criteria.teamCount !== lobbyTeamConfig` exact check with:

```
if criteria.teamCount === '8+':
    skip if lobbyTeamConfig is not a number >= 8
else:
    skip if criteria.teamCount !== lobbyTeamConfig  (unchanged)
```

The players-per-team slider comparison is unaffected — it uses the actual lobby's `teamCount` to compute `playersPerTeam`, not the criteria value.

### UI — `LobbyDiscoveryUI.ts`

- Add `['discovery-team-8plus', '8+']` entry to `TEAM_COUNT_CHECKBOXES` after the `7` entry.
- Add `${this.renderChip('discovery-team-8plus', '8+', '8+')}` in the HTML template after the `7` chip.
- In `setTeamCountSelections`: handle `'8+'` the same way numbers are handled — find `document.getElementById('discovery-team-8plus')`.
- In `getAllTeamCountValues`: `'8+'` is returned as-is (not parsed as a number).

### Notification text

No changes needed. `getLobbyModeLabel` already handles `typeof teamConfig === 'number'` generically (e.g. "10 teams"), so matched 8+ lobbies will display correctly.

### Settings persistence

`'8+'` is stored as a string in `GM_setValue` alongside existing criteria. `normalizeSettings` → `sanitizeCriteria` → `sanitizeCriteriaTeamCount` → `parseTeamCount` round-trips it correctly.

---

## Edge cases

- **User selects both `7` and `8+`**: both are independent criteria rows — already how multi-selection works, no special handling needed.
- **Lobby with exactly 8 teams**: matches `8+`.
- **Players-per-team slider with `8+`**: works as normal — uses actual lobby team count, not the `'8+'` literal.

---

## Out of scope

- No changes to the FFA section.
- No changes to modifier filters.
- No UI changes to the slider tick marks or range labels.
