## Context
The auto-join panel is currently a floating, draggable element with its own position storage. The player list is a fixed right-side column that already defines the lobby sidebar layout.

## Goals / Non-Goals
- Goals:
  - Anchor the auto-join panel within the player list column so it moves and resizes with the column.
  - Reduce vertical height by reorganizing controls horizontally while preserving all settings.
  - Allow a one-click collapse to reclaim vertical space for the player list.
- Non-Goals:
  - Change auto-join matching logic or storage keys beyond layout state.
  - Redesign overall theme or player list behavior.

## Decisions
- Decision: Insert the auto-join panel as a child of the player list container, above the player list content, and remove independent drag positioning.
- Decision: Use a compact two-column layout for the main configuration blocks (FFA and Team) and a compressed header/footer row to reduce height.
- Decision: Provide a collapse toggle in the auto-join header; collapsed state hides the panel body and reduces to a single header row.
- Decision: Do not persist the collapsed state; it resets on each page load.

## Risks / Trade-offs
- Removing drag positioning may surprise users; mitigated by a consistent anchored layout with the player list panel.
- Compact horizontal layout may reduce readability; mitigated by clear section headers and consistent spacing.

## Migration Plan
- Keep existing autoJoinPanelPosition storage key unused but intact to avoid breaking user data.
- Add a new storage key for collapsed state if persistence is required.

## Open Questions
- None
