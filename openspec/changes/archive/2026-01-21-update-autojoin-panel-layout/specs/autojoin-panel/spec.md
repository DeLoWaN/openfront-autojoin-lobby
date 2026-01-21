## ADDED Requirements
### Requirement: Embedded Auto-Join Panel
The system SHALL render the auto-join panel inside the right-side player list column and align its width with the player list panel.

#### Scenario: Auto-join panel is anchored to the player list column
- **WHEN** the player list panel is visible in the lobby
- **THEN** the auto-join panel appears above the player list content inside the same container and resizes with the column width

### Requirement: Compact Horizontal Layout
The system SHALL present auto-join controls in a compact, horizontal layout that reduces vertical footprint while keeping all controls accessible.

#### Scenario: Controls remain available in a compact layout
- **WHEN** the auto-join panel is visible
- **THEN** configuration controls are arranged horizontally to reduce height without hiding any settings

### Requirement: Collapse Toggle
The system SHALL provide a collapse control in the auto-join header to hide or show the panel body.

#### Scenario: User collapses the auto-join panel
- **WHEN** the user activates the collapse control
- **THEN** the auto-join panel body is hidden and the player list content expands vertically

#### Scenario: Collapse state resets on page load
- **WHEN** the page loads
- **THEN** the auto-join panel body is shown regardless of its previous state
