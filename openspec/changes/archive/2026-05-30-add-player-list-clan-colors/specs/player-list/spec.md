# Player List Display - Spec Delta

## ADDED Requirements

### Requirement: Team-Based Clan Color Assignment
The system SHALL assign clan accent colors based on OpenFront's team assignment rules.
Clans that are assigned to the same team in the lobby preview SHALL share the same color.
The palette and assignment logic SHALL match OpenFront's team color allocator, including extended colors for Team 1..N.

#### Scenario: Clans on the same team share a color
- **WHEN** multiple clans are assigned to the same team in a Team lobby preview
- **THEN** those clans render with the same accent color

#### Scenario: Team palette matches OpenFront
- **WHEN** a Team lobby renders with fewer than 8 teams
- **THEN** the team colors follow OpenFront's ordered palette (Red, Blue, Yellow, Green, Purple, Orange, Teal)
- **AND** the corresponding clans use those same colors

#### Scenario: Extended palette used for many teams
- **WHEN** a Team lobby renders with 8 or more teams (Team 1..N)
- **THEN** team colors are assigned using the OpenFront extended palette logic

### Requirement: Clan Color Styling
The system SHALL apply the team-based clan accent color to the clan group header and player pills using a subtle background tint and border/accent.
Untagged players SHALL retain the existing styling.

#### Scenario: Clan header and players use the accent color
- **WHEN** a clan group is displayed
- **THEN** the clan header shows an accent using the group's clan color
- **AND** player pills inside the group use a subtle tint or border derived from the same clan color

#### Scenario: Untagged players remain unchanged
- **WHEN** a player has no clan tag
- **THEN** the player entry retains the existing non-clan styling

### Requirement: Current Player Clan Cue
The system SHALL indicate the current player's clan with an additional visual cue while keeping the same team-based clan color as other clans.
The previous blue highlight styling SHALL be replaced by this cue.

#### Scenario: Current player's clan is indicated without overriding the clan color
- **WHEN** the current player's clan group is displayed
- **THEN** the group uses its assigned team color like any other clan
- **AND** an additional cue (badge or icon) indicates it is the user's clan

### Requirement: Nation Count Fallback
The system SHALL attempt to use map manifest data to estimate nation count when computing team assignment for Duos/Trios/Quads.
If manifest data is unavailable, the system SHALL fall back to a default nation count of 0, accepting minor mismatch.

#### Scenario: Manifest fetch succeeds
- **WHEN** the lobby game config specifies a map
- **THEN** the system fetches the map manifest to obtain nation count for team preview assignment

#### Scenario: Manifest fetch fails
- **WHEN** the map manifest cannot be fetched
- **THEN** the team assignment proceeds with nation count 0
