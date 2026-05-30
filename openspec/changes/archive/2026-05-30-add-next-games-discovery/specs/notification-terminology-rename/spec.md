## MODIFIED Requirements

### Requirement: User-Facing Terminology Uses Notification/Manual-Join Language
User-visible labels, headings, status text, and help text MUST describe the feature as notification/manual discovery and MUST NOT describe it as auto-join. User-facing copy MAY describe the manual quick-join navigation affordance using manual-join language (for example "quick-join" or "join"), provided it does not imply automated joining.

#### Scenario: Panel is displayed
- **WHEN** the user views the lobby discovery panel
- **THEN** visible copy SHALL use notification/manual-join terminology, MAY reference manual quick-join, and SHALL NOT include "Auto-Join"

#### Scenario: Discovery state changes
- **WHEN** discovery status transitions between enabled and disabled states
- **THEN** status labels SHALL communicate notification discovery state without auto-join wording

#### Scenario: Upcoming-game join affordance is shown
- **WHEN** an upcoming-game card presents its join affordance
- **THEN** the affordance MAY be the clickable card itself behaving like a native lobby card (no dedicated "join" button required), and any accompanying label — visible or accessible (e.g. an `aria-label`) — SHALL use manual-join language and SHALL NOT describe the action as auto-join
