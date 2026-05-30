# Change: Tactical HUD UI Redesign (Auto-Join + Player List)

## Why
The current userscript UI is functional but visually generic. A cohesive tactical HUD aesthetic will improve clarity and create a stronger, game-native feel while preserving all existing features.

## What Changes
- Redesign the Auto-Join panel with a tactical HUD look and dock it inside the Player List sidebar.
- Redesign the docked Player List sidebar with HUD sections, chips, and group styling.
- Reskin game-found notifications and toast-style alerts to match the HUD theme.
- Update theme tokens (colors, typography stacks, spacing, shadows) to support the new visual language.
- Add a small set of purposeful animations (panel entrance, status pulse, staggered list items).

## Impact
- Affected specs: style-ui (new)
- Affected code: src/config/theme.ts, src/styles/styles.ts, src/modules/auto-join/AutoJoinUI.ts, src/modules/player-list/PlayerListUI.ts
