## Purpose
Define guardrails that keep lobby discovery strictly manual-join and prohibit automation actions.

## Requirements

### Requirement: Programmatic Join/Rejoin Is Prohibited
The userscript MUST NOT initiate lobby join, rejoin, or lobby-switch actions from background logic, criteria matching, watcher callbacks, or timed processing. Lobby entry MUST require explicit user interaction with OpenFront UI controls.

#### Scenario: Matching lobby is detected
- **WHEN** discovery processing finds a lobby that matches the configured criteria
- **THEN** the userscript MUST NOT trigger a join action for that lobby

#### Scenario: Clanmate match is detected
- **WHEN** player list updates indicate that a clanmate is present in a lobby
- **THEN** the userscript MUST NOT trigger a join action on the player's behalf

### Requirement: Clan Tag Apply Is Non-Navigational
Applying a clan tag through quick-switch or clan-group actions MUST only update the username/clan-tag inputs and MUST NOT perform automated leave-then-join rejoin behavior.

#### Scenario: Quick tag switch is used
- **WHEN** the user applies a saved clan tag from the player list quick-switch UI
- **THEN** the userscript MUST update the relevant input fields without leaving or joining a lobby

#### Scenario: Clan-group use-tag action is used
- **WHEN** the user clicks a clan group's "Use tag" action
- **THEN** the userscript MUST apply the tag only and MUST NOT execute lobby navigation actions
