## ADDED Requirements
### Requirement: Auto Rejoin on Clan Tag Apply
The system SHALL expose an "auto rejoin lobby when applying clan tag" toggle in the auto-join panel and persist it within auto-join settings while keeping existing rejoin behavior.

#### Scenario: Auto rejoin enabled
- **WHEN** auto rejoin is enabled and the user applies a clan tag
- **THEN** the system leaves and rejoins the lobby to refresh the username

#### Scenario: Auto rejoin disabled
- **WHEN** auto rejoin is disabled and the user applies a clan tag
- **THEN** the system updates the clan tag without rejoining the lobby

### Requirement: Auto Rejoin Setting Migration
The system SHALL migrate the legacy player-list auto-rejoin setting into auto-join settings when needed, without removing the legacy key.

#### Scenario: Legacy key present
- **WHEN** the legacy auto-rejoin setting exists and auto-join settings do not define a value
- **THEN** the system copies the legacy value into auto-join settings and continues to honor it
