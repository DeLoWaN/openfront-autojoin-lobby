## MODIFIED Requirements

### Requirement: Programmatic Join/Rejoin Is Prohibited
The userscript MUST NOT initiate lobby join, rejoin, or lobby-switch actions from background logic, criteria matching, watcher callbacks, or timed processing. The userscript MAY navigate to OpenFront's join modal in direct response to an explicit user click on a discovery card (including an upcoming-game card); final lobby entry MUST still require explicit user interaction with OpenFront's own controls.

#### Scenario: Matching lobby is detected
- **WHEN** discovery processing finds a lobby that matches the configured criteria
- **THEN** the userscript MUST NOT trigger a join or navigation action for that lobby on its own

#### Scenario: Clanmate match is detected
- **WHEN** player list updates indicate that a clanmate is present in a lobby
- **THEN** the userscript MUST NOT trigger a join action on the player's behalf

#### Scenario: User clicks an upcoming-game card
- **WHEN** the user explicitly clicks an upcoming-game card
- **THEN** the userscript MAY navigate to OpenFront's join modal for that game, and the user MUST still confirm entry through OpenFront's own controls

#### Scenario: No user interaction occurs
- **WHEN** an upcoming game matches criteria but the user does not click its card
- **THEN** the userscript MUST NOT navigate to or enter that game
