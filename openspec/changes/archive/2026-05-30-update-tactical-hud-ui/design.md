## Context
The userscript UI (Auto-Join + Player List) currently uses a minimal panel style. The goal is a tactical HUD visual direction based on the provided reference, while retaining all features and docking Auto-Join inside the Player List sidebar.

## Goals / Non-Goals
- Goals:
  - Apply a cohesive tactical HUD style across panels, controls, and notifications.
  - Preserve existing behaviors, settings, and storage keys.
  - Use standard system font stacks only (no external web font loading).
  - Dock Auto-Join inside the Player List sidebar; keep the sidebar resizable.
  - Use a small set of purposeful animations without degrading performance.
- Non-Goals:
  - Feature changes or logic changes in Auto-Join or Player List.
  - Mobile-specific layout work.
  - Changes to data fetching, storage formats, or sound behavior.

## Decisions
- Update theme tokens in src/config/theme.ts to define HUD colors, gradients, and typography stacks.
- Refactor src/styles/styles.ts to introduce HUD-specific component classes (panel frame, header strip, section card, chips, status pill, glow accents).
- Keep DOM IDs and data attributes unchanged for event wiring; adjust classes and layout wrappers where needed.
- Mount Auto-Join into the Player List sidebar container and remove drag behavior.
- Style notifications as HUD cards with strong emphasis and clear dismissal, matching the panel aesthetic.

## Alternatives Considered
- Keep Auto-Join as a floating draggable panel. Rejected in favor of a unified sidebar stack.
- Load external fonts (Rajdhani/Inter). Rejected to comply with standard-font requirement.

## Risks / Trade-offs
- Visual effects (glow, blur) could impact performance. Mitigation: limit box-shadow layers, avoid heavy filters, and animate only opacity/transform.
- UI density could reduce readability. Mitigation: define clear spacing and typography scale in tokens.

## Migration Plan
1. Update theme tokens (colors, fonts, spacing).
2. Replace panel/control styles with HUD variants in styles.ts.
3. Update Auto-Join markup/classes for docked layout.
4. Update Player List markup/classes to host the docked Auto-Join slot.
5. Restyle notification markup and animations.
6. Manual verification in lobby; confirm no behavior regressions.

## Open Questions
- None.
