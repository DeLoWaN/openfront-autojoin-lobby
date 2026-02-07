## Purpose
Define notification-driven lobby discovery behavior for manual join workflows.

## Requirements

### Requirement: Notify-Only Discovery
The userscript SHALL continue discovering matching lobbies and presenting notifications, while remaining strictly notify-only and non-joining.

#### Scenario: Team criteria match triggers notification
- **WHEN** a lobby matches the configured Team criteria
- **THEN** the userscript SHALL display a game-found notification without joining the lobby

#### Scenario: Repeated processing of the same match
- **WHEN** the same matching lobby is processed repeatedly during discovery updates
- **THEN** the userscript SHALL avoid duplicating notifications beyond the configured deduplication behavior

### Requirement: Team Criteria Filtering Remains Available
The userscript SHALL keep Team criteria configuration available for manual discovery, including team-format filters and players-per-team constraints.

#### Scenario: Team format criteria is configured
- **WHEN** the user selects specific Team formats (for example Duos, Trios, Quads, or numeric team counts)
- **THEN** discovery matching SHALL evaluate lobbies against those selected Team formats

#### Scenario: Players-per-team range is configured
- **WHEN** the user sets Team min/max players-per-team constraints
- **THEN** discovery matching SHALL only notify for lobbies that satisfy the configured range

### Requirement: Notification Controls Persist
Notification enablement and sound preferences SHALL be configurable and persisted across sessions.

#### Scenario: Notifications are disabled
- **WHEN** the user disables lobby discovery notifications
- **THEN** subsequent matching lobbies SHALL NOT create game-found notifications until notifications are re-enabled

#### Scenario: Sound preference is enabled
- **WHEN** a game-found notification is shown while sound is enabled
- **THEN** the userscript SHALL play the configured notification sound
