# Change: Auto-Join Modes Compact + Hover Reveal

## Why
The auto-join panel consumes vertical space in the lobby. Users want to hide the modes configuration while keeping critical controls visible, and they want a lightweight, hover-reveal interaction without nested collapsibles.

## What Changes
- Add a compact modes state that hides the modes configuration area only.
- Keep the status bar and both action buttons (Auto-Join/Notify and Clanmate) visible in compact state.
- Provide hover-to-expand behavior that auto-collapses on mouse leave (no persistence).
- Replace or repurpose the existing full-panel collapse so there is only one collapsible interaction.

## Impact
- Affected specs: specs/autojoin-ui/spec.md (new capability)
- Affected code: src/modules/auto-join/AutoJoinUI.ts, src/styles/styles.ts, tests/**
