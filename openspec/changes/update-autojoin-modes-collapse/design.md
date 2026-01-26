## Context
The auto-join panel currently supports a full-panel collapse that hides all body content. The request is to instead hide only the Modes configuration to free space, while keeping status and action controls visible. The Modes area should auto-expand on hover and auto-collapse on mouse leave, with a discoverable, non-textual affordance.

## Goals / Non-Goals
- Goals:
  - Hide the Modes configuration without hiding status or action controls.
  - Provide a hover-reveal interaction that auto-collapses on pointer leave.
  - Avoid nested collapsible menus (single collapsible interaction only).
  - Keep the UI discoverable without explicit text cues.
- Non-Goals:
  - Persisting compact/expanded state across sessions.
  - Changing auto-join logic or criteria evaluation.

## Decisions
- Decision: Replace the full-panel collapse with a modes-only compact state.
- Decision: Use a hover-reveal drawer/rail for Modes with a non-textual affordance.
- Decision: Default to compact when not hovered (no persistence).

## Alternatives considered
1) Hover-reveal Modes drawer
   - A thin "Modes rail" is always visible beneath the action row.
   - The rail shows non-textual cues (caret + FFA/HvN/Team icons or dots).
   - On hover over the rail or Modes area, the configuration expands (max-height + opacity transition).
   - On pointer leave, it auto-collapses back to the rail.
   - Pros: satisfies hover reveal; keeps critical controls visible; no nested collapse.
   - Cons: potential accidental reveals; mitigated with small hover delay (e.g., 100ms).

## Risks / Trade-offs
- Accidental hover expansions may distract users. Mitigation: short hover delay and smaller reveal area.
- Reduced discoverability if the affordance is too subtle. Mitigation: stronger contrast, iconography, and hover glow.

## Migration Plan
- No data migration needed; collapse state is not persisted.
- Replace the existing full-panel collapse control with the new modes compact behavior.

## Open Questions
- None (behavior clarified: hover-only, non-persistent).
