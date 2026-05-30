# Player List Display - Spec Delta

## ADDED Requirements

### Requirement: Compact Horizontal Layout for Clan Groups

The player list SHALL display players within clan groups using a space-efficient horizontal layout with pill-style boxes, removing redundant clan tag information.

#### Scenario: Player with clan tag displayed within clan group

- **WHEN** a player `[ABC] PlayerName` is displayed within the `[ABC]` clan group section
- **THEN** only `PlayerName` is shown (clan tag prefix stripped)
- **AND** the username is displayed in a small box/pill style
- **AND** the box uses the existing theme colors and design system

#### Scenario: Multiple players in horizontal wrapped layout

- **WHEN** a clan group contains multiple players
- **THEN** players are displayed horizontally in a flexbox layout with wrapping
- **AND** each player box is visually separated from others
- **AND** boxes wrap to new lines when panel width is insufficient
- **AND** layout adapts responsively to panel resizing

#### Scenario: Player without clan tag remains unchanged

- **WHEN** a player has no clan tag
- **THEN** the player is displayed in the vertical list format (unchanged behavior)
- **AND** the full username is shown
- **AND** existing vertical list styling is preserved

#### Scenario: Long username handling

- **WHEN** a player has a very long username
- **THEN** the box expands horizontally to fit the full username
- **AND** no text truncation or ellipsis is applied
- **AND** the full username remains readable

### Requirement: Preserve Existing Functionality

All existing player list features SHALL continue to work with the new compact layout.

#### Scenario: Player join/leave animations work in horizontal layout

- **WHEN** a new player joins a clan group
- **THEN** the player box animates in with the existing enter animation
- **AND** stagger delays apply correctly for multiple simultaneous joins
- **AND** animations are visually smooth in the horizontal layout

#### Scenario: Current player clan highlighting preserved

- **WHEN** the current player's clan group is displayed
- **THEN** the clan group header shows the blue highlight
- **AND** all player boxes within the group show the blue background tint
- **AND** the left border accent is visible on the group

#### Scenario: Hover states work on player boxes

- **WHEN** the user hovers over a player box within a clan group
- **THEN** the hover background color is applied to the entire box
- **AND** the hover state is visually distinct from the default state
- **AND** hover behavior for untagged players remains unchanged

### Requirement: Helper Function for Clan Tag Stripping

The system SHALL provide a pure helper function to strip clan tag prefixes from player names.

#### Scenario: Strip standard clan tag format

- **WHEN** `stripClanTag()` is called with `"[ABC] PlayerName"`
- **THEN** the function returns `"PlayerName"`

#### Scenario: Handle name without clan tag

- **WHEN** `stripClanTag()` is called with `"PlayerName"`
- **THEN** the function returns `"PlayerName"` (unchanged)

#### Scenario: Handle malformed clan tag

- **WHEN** `stripClanTag()` is called with `"[ABC]PlayerName"` (no space after tag)
- **THEN** the function returns `"PlayerName"`

#### Scenario: Preserve non-tag brackets

- **WHEN** `stripClanTag()` is called with `"Player[Name]"`
- **THEN** the function returns `"Player[Name]"` (unchanged, brackets not at start)
