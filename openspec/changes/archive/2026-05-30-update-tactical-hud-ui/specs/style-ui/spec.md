## ADDED Requirements
### Requirement: Tactical HUD Theme
The system SHALL render the userscript UI using a tactical HUD visual theme with layered glass panels, cyan/indigo accents, and muted surfaces.

#### Scenario: Lobby view
- **WHEN** the user is on the lobby page
- **THEN** the Auto-Join and Player List panels display with the tactical HUD theme

### Requirement: Docked Auto-Join Layout
The system SHALL dock the Auto-Join panel inside the Player List sidebar above the player list content.

#### Scenario: Panel placement on load
- **WHEN** the lobby UI is initialized
- **THEN** Auto-Join appears inside the right-side sidebar and the Player List remains docked with a resize handle

### Requirement: HUD Control Styling
The system SHALL style all userscript controls (buttons, toggles, sliders, chips, clan headers) to match the tactical HUD theme while preserving their existing behaviors.

#### Scenario: Using configuration controls
- **WHEN** the user interacts with Auto-Join and Player List controls
- **THEN** the controls present consistent HUD styling and function as before

### Requirement: Non-Collapsible Clan Groups
The system SHALL display clan groups fully expanded and SHALL NOT provide collapse controls.

#### Scenario: Player list rendering
- **WHEN** the player list is rendered
- **THEN** clan groups show all members without collapse toggles

### Requirement: HUD Notifications
The system SHALL render game-found notifications and toast-style alerts using the tactical HUD styling.

#### Scenario: Game found in notify mode
- **WHEN** a matching lobby is found in notify mode
- **THEN** a HUD-styled notification is displayed and can be dismissed

### Requirement: Standard Font Stacks
The system SHALL use standard system font stacks and MUST NOT load external web fonts.

#### Scenario: UI rendering
- **WHEN** the userscript UI is injected
- **THEN** typography uses only local system fonts

### Requirement: Purposeful Motion
The system SHALL use a small set of purposeful animations (panel entrance, status pulse, staggered list entries) without excessive motion.

#### Scenario: UI updates
- **WHEN** panels appear or player entries update
- **THEN** animations are subtle and limited to opacity/transform

### Requirement: Desktop Targeting
The system SHALL target desktop layouts and does not require mobile-specific layout behavior.

#### Scenario: Desktop use
- **WHEN** the UI is displayed in a desktop viewport
- **THEN** the layout presents the full HUD panels without mobile adaptations
