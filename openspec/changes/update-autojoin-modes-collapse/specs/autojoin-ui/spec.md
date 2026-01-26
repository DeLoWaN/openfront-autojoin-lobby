## ADDED Requirements
### Requirement: Modes Compact State
The auto-join panel SHALL support a compact state that hides the Modes configuration area while keeping the status bar and action buttons visible.

#### Scenario: Compact state keeps actions visible
- **WHEN** the Modes area is compacted
- **THEN** the status bar and both action buttons remain visible and usable
- **AND** the Modes configuration controls are not displayed

### Requirement: Hover Reveal for Modes
The Modes area SHALL auto-expand on pointer hover over the Modes affordance and auto-collapse on pointer leave, without persisting state.

#### Scenario: Hover expands and collapses
- **WHEN** the pointer enters the Modes affordance area
- **THEN** the Modes configuration is revealed
- **AND WHEN** the pointer leaves the Modes area
- **THEN** the configuration collapses automatically

### Requirement: Non-Textual Expand Affordance
When the Modes area is compacted, the UI SHALL display a non-textual affordance indicating it can be expanded.

#### Scenario: Affordance visible in compact state
- **WHEN** the Modes area is compacted
- **THEN** a visual indicator (caret/rail/icons) is visible without explicit text

### Requirement: Single Collapsible Interaction
The auto-join panel SHALL not present nested collapsible menus for Modes.

#### Scenario: Only one collapsible control
- **WHEN** the panel is in compact Modes state
- **THEN** there is no additional full-panel collapse control
