## ADDED Requirements

### Requirement: FFA and Humans Vs Nations Mode Selectors Are Removed
The discovery configuration UI MUST NOT present selectable filters for `FFA` or `Humans Vs Nations`.

#### Scenario: Discovery panel is rendered
- **WHEN** the user opens the discovery configuration panel
- **THEN** only supported mode selectors SHALL be shown and `FFA` / `Humans Vs Nations` selectors SHALL be absent

### Requirement: Legacy Removed-Mode Criteria Are Sanitized
Persisted criteria entries targeting removed modes (`FFA`, `HvN`, or `Humans Vs Nations`) MUST be ignored or removed during settings load so they cannot influence discovery behavior.

#### Scenario: Saved settings contain only removed modes
- **WHEN** the userscript loads persisted criteria that contain only removed modes
- **THEN** the loaded criteria set SHALL contain no removed-mode entries

#### Scenario: Saved settings contain mixed modes
- **WHEN** the userscript loads persisted criteria containing both supported Team criteria and removed modes
- **THEN** removed-mode entries SHALL be dropped and supported Team criteria SHALL be preserved

### Requirement: Removed Modes Are Not Evaluated as Configurable Filters
Discovery matching logic MUST NOT evaluate configurable filter criteria for removed modes.

#### Scenario: Discovery cycle runs after migration
- **WHEN** lobby updates are processed after settings have been loaded and sanitized
- **THEN** matching SHALL evaluate only supported criteria and SHALL NOT evaluate removed-mode criteria branches
