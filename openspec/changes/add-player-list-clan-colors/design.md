## Context
We want per-clan colors in the player list that match OpenFront's team assignment and team palette. Clans that land on the same team in a Team game should share the same color. The userscript runs independently from the game client, so the palette and assignment logic must be embedded in the bundle.

## Goals / Non-Goals
- Goals:
  - Improve readability by giving each clan a team-based accent color.
  - Match OpenFront's team assignment (clan grouping into teams) for Team lobbies.
  - Match OpenFront's team palette, including extended colors for Team 1..N.
  - Keep colors stable within a session so they do not shift during updates.
- Non-Goals:
  - Synchronize with server-side team assignments.
  - Fetch palette data at runtime from OpenFront.

## Decisions
- Decision: Replicate OpenFront's team assignment algorithm (`TeamAssignment.assignTeamsLobbyPreview`) so clans are assigned to teams based on size and balanced distribution.
- Decision: Replicate OpenFront's team list ordering from `LobbyPlayerView.getTeamList`, including special cases (HumansVsNations, <8 teams using fixed color order, >=8 teams using "Team N").
- Decision: Replicate OpenFront's color palette logic (`Colors.ts` + `ColorAllocator`) so Team 1..N colors match the extended human palette.
- Decision: Fetch map manifest (`/maps/<map>/manifest.json`) to compute nation count when needed; if unavailable, fall back to 0 and accept minor mismatch.
- Decision: Apply a CSS variable `--clan-color` on `.of-clan-group` and use it for header accents and player pill borders/backgrounds.
- Decision: Mark the current player's clan with an additional cue (e.g., a "You" badge or dot) while keeping the same clan color as other clans.

## Alternatives considered
- Random per-session assignment: simpler but colors can shift on render updates. Rejected for stability.
- Hash-only mapping: does not respect team assignment or team color allocation. Rejected for accuracy.

## Risks / Trade-offs
- Some palette colors may have low contrast against the dark UI. Mitigate with translucent backgrounds and a consistent border.
- Map manifest fetch may fail; fallback to 0 nation count may slightly alter team counts in Duos/Trios/Quads.

## Migration Plan
No data migration required. This is a UI-only change.

## Open Questions
None.
