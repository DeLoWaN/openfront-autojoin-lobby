# Player List Display - Spec Delta

## ADDED Requirements

### Requirement: Team-Grouped Player List in Team Mode

When the lobby is in Team mode, the player list SHALL group clans and solo players under team headers.

#### Scenario: Team header uses team label and color
- **WHEN** the lobby is in Team mode
- **THEN** each team group displays a compact header showing the team label
- **AND** the header color matches the team color used by the lobby team allocation rules
- **AND** the header label uses color names for <8 teams and "Team N" labels for ≥8 teams

#### Scenario: Clans remain nested within their team
- **WHEN** clans are present in Team mode
- **THEN** each clan appears within its assigned team group
- **AND** clan stats and the "Use tag" action remain visible

#### Scenario: Solo players are appended after clans
- **WHEN** a team contains players without clan tags
- **THEN** those players appear after clan groups within the same team group
- **AND** they use the existing player pill layout with full names

#### Scenario: Current player's team is prioritized
- **WHEN** the current player is assigned to a team in Team mode
- **THEN** that team group is listed first
- **AND** remaining teams follow the canonical team order

#### Scenario: Show-only-clans hides solo players and empty teams
- **WHEN** "Show only players with clan tags" is enabled
- **THEN** solo players are hidden
- **AND** teams with no clan groups are not displayed

### Requirement: Neutral Clan Card Styling Under Team Groups

Clan cards SHALL remain visually neutral so team color is conveyed only by the team header/band.

#### Scenario: Clan card uses neutral styling
- **WHEN** a clan group is rendered under a team group
- **THEN** the clan card uses the standard neutral border/background styling
- **AND** the team color is not applied to clan card borders or backgrounds

### Requirement: Preserve Player Pill Layout

Player display inside clan groups SHALL retain the existing horizontal pill layout with full names.

#### Scenario: Full name is preserved
- **WHEN** a player is rendered within a clan group
- **THEN** the full username is displayed
- **AND** the pill layout wraps horizontally as in the current compact layout

### Requirement: FFA Solo Player Coloring

In FFA lobbies, untagged players SHALL retain the existing list layout and receive per-player stable colors.

#### Scenario: FFA layout unchanged for clans
- **WHEN** the lobby is in FFA mode
- **THEN** clan grouping remains unchanged
- **AND** no team headers are shown

#### Scenario: Solo players receive stable colors in FFA
- **WHEN** a player has no clan tag in FFA mode
- **THEN** the player entry uses a per-player color accent
- **AND** the color assignment remains stable across updates
