## ADDED Requirements
### Requirement: Clan Member Auto-Join
The system SHALL provide a one-shot button in the auto-join panel that arms a clanmate watcher and automatically joins the lobby when the player list contains a player whose clan tag matches the user's clan tag input.

#### Scenario: Match triggers auto-join
- **WHEN** the clanmate watcher is armed and a player list update includes a matching clan tag
- **THEN** the system initiates a lobby join action immediately, regardless of auto-join active/inactive state or notify-only mode

#### Scenario: One-shot behavior
- **WHEN** the system attempts a clanmate-triggered auto-join
- **THEN** the clanmate watcher is disarmed after the attempt

#### Scenario: Clan tag is empty
- **WHEN** the clanmate watcher is armed and the clan tag input is empty
- **THEN** the system does not perform a clan-based auto-join and disarms the watcher

### Requirement: Auto-Join Status Placement
The system SHALL display auto-join status indicators (active state, game-found state, search timer) next to the sound toggle in the auto-join panel footer, aligned left, without shrinking the main auto-join/notify button.

#### Scenario: Auto-join panel renders
- **WHEN** the auto-join panel is shown
- **THEN** the status indicators appear adjacent to the sound toggle and the main mode button retains its intended width

### Requirement: Clanmate Auto-Join Independence
The system SHALL communicate in the auto-join panel UI that the clanmate auto-join action is independent of the auto-join active/notify mode.

#### Scenario: Clanmate action is presented
- **WHEN** the auto-join panel renders the clanmate auto-join control
- **THEN** the UI includes a brief hint that the action is separate from auto-join active/notify mode
