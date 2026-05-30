## MODIFIED Requirements

### Requirement: Notify-Only Discovery
The userscript SHALL continue discovering matching lobbies and presenting notifications, while never performing an automated lobby join. Discovery SHALL evaluate both the live (featured) lobby and the upcoming lobby for each slot, so a configured criteria match SHALL be detected whether the matching game is live now or queued next.

#### Scenario: Team criteria match triggers notification
- **WHEN** a lobby matches the configured Team criteria
- **THEN** the userscript SHALL display a game-found notification without performing an automated join

#### Scenario: Upcoming lobby matches criteria
- **WHEN** the upcoming lobby for a slot matches the configured criteria and upcoming notifications are enabled
- **THEN** the userscript SHALL present a game-found notification for that upcoming game without performing an automated join

#### Scenario: Repeated processing of the same match
- **WHEN** the same matching lobby (live or upcoming) is processed repeatedly during discovery updates
- **THEN** the userscript SHALL avoid duplicating notifications beyond the configured deduplication behavior

## ADDED Requirements

### Requirement: Upcoming Match Notification Parity And Gating
When upcoming notifications are enabled, a match on an upcoming game SHALL alert using the same notification treatment (visual highlight and sound) as a live match. When upcoming notifications are disabled, upcoming matches SHALL NOT produce notifications, while upcoming games MAY still be displayed.

#### Scenario: Upcoming notifications enabled
- **WHEN** an upcoming game matches criteria and the upcoming-notification setting is enabled
- **THEN** the userscript SHALL alert with the same highlight and sound used for a live match

#### Scenario: Upcoming notifications disabled
- **WHEN** an upcoming game matches criteria and the upcoming-notification setting is disabled
- **THEN** the userscript SHALL NOT produce a notification or sound for that upcoming match
