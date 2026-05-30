# Auto-Join System - Spec Delta

## ADDED Requirements

### Requirement: Humans Vs Nations Pseudo-Mode Support

The Auto-Join system SHALL support filtering for "Humans Vs Nations" (HvN) game mode as a top-level selectable option alongside FFA and Team modes.

#### Scenario: HvN checkbox appears in Auto-Join panel

- **WHEN** the Auto-Join panel is rendered
- **THEN** a "Humans Vs Nations" checkbox is displayed after the Team configuration section
- **AND** the checkbox uses the same visual card styling as FFA and Team modes
- **AND** the checkbox has ID `autojoin-hvn` for event binding

#### Scenario: HvN checkbox has no configuration options

- **WHEN** the HvN checkbox is checked
- **THEN** no additional configuration UI appears (unlike FFA/Team which show player filters)
- **AND** the checkbox state directly controls HvN criteria inclusion

#### Scenario: User can select HvN independently

- **WHEN** the user checks only the HvN checkbox
- **THEN** the Auto-Join system searches exclusively for HvN lobbies
- **AND** FFA and Team lobbies are not matched

#### Scenario: User can combine HvN with other modes

- **WHEN** the user checks both FFA and HvN checkboxes
- **THEN** the Auto-Join system searches for lobbies matching either FFA OR HvN criteria
- **AND** both types of lobbies trigger auto-join or notification

### Requirement: HvN Criteria Type Support

The criteria type system SHALL recognize HvN as a valid game mode value.

#### Scenario: HvN extends gameMode union type

- **WHEN** TypeScript code references `AutoJoinCriteria` interface
- **THEN** the `gameMode` field accepts `'FFA' | 'Team' | 'HvN'` values
- **AND** TypeScript compiler enforces exhaustive handling in switch statements

#### Scenario: HvN criteria structure

- **WHEN** HvN criteria is created
- **THEN** the criteria object contains `{gameMode: 'HvN', teamCount: null, minPlayers: null, maxPlayers: null}`
- **AND** the null values indicate no filtering constraints apply

### Requirement: HvN Lobby Detection

The system SHALL correctly identify HvN lobbies from OpenFront.io API data.

#### Scenario: Detect HvN lobby from API response

- **WHEN** a lobby has `gameConfig.gameMode === "Team"` AND `gameConfig.playerTeams === "Humans Vs Nations"`
- **THEN** the lobby is identified as an HvN lobby
- **AND** HvN criteria will match this lobby

#### Scenario: HvN criteria does not match non-HvN Team lobbies

- **WHEN** a lobby has `gameConfig.gameMode === "Team"` AND `gameConfig.playerTeams === "Duos"`
- **THEN** HvN criteria does NOT match this lobby
- **AND** only Team criteria (without specific teamCount) would match

#### Scenario: HvN criteria does not match FFA lobbies

- **WHEN** a lobby has `gameConfig.gameMode === "Free For All"`
- **THEN** HvN criteria does NOT match this lobby
- **AND** only FFA criteria would match

#### Scenario: Missing playerTeams field handling

- **WHEN** a lobby response lacks the `gameConfig.playerTeams` field
- **THEN** HvN criteria does NOT match this lobby (safe failure)
- **AND** no error is thrown (defensive optional chaining)

### Requirement: HvN Matching Logic

The matching engine SHALL apply HvN-specific matching rules when HvN criteria is active.

#### Scenario: HvN criteria matches exact playerTeams value

- **WHEN** HvN criteria is checked against a lobby
- **THEN** the match succeeds only if `playerTeams === "Humans Vs Nations"` (exact string match)
- **AND** case-sensitive comparison is used

#### Scenario: HvN criteria ignores player count filters

- **WHEN** HvN criteria is checked against a lobby with any player capacity
- **THEN** no minimum or maximum player count validation is performed
- **AND** lobbies of any size match (if playerTeams is correct)

#### Scenario: Multiple criteria including HvN

- **WHEN** criteria list contains `[{gameMode: 'FFA', ...}, {gameMode: 'HvN', ...}]`
- **THEN** the matching engine checks each criteria sequentially
- **AND** returns true on the first matching criteria (OR logic)

### Requirement: HvN Settings Persistence

HvN selection state SHALL persist across browser sessions using existing storage mechanism.

#### Scenario: Save HvN selection to storage

- **WHEN** the user checks the HvN checkbox
- **THEN** the criteria list is saved to `GM_storage` with key `autoJoinSettings`
- **AND** the saved criteriaList array includes the HvN criteria object

#### Scenario: Load HvN selection from storage

- **WHEN** the Auto-Join panel initializes
- **THEN** the HvN checkbox state is loaded from saved criteriaList
- **AND** if criteriaList contains `{gameMode: 'HvN', ...}`, the checkbox is checked

#### Scenario: HvN settings survive page refresh

- **WHEN** the user checks HvN, refreshes the page, and reopens the Auto-Join panel
- **THEN** the HvN checkbox remains checked
- **AND** HvN criteria is active in the matching engine

### Requirement: HvN Event Handling

User interactions with the HvN checkbox SHALL trigger appropriate state updates and persistence.

#### Scenario: Checking HvN checkbox updates criteria

- **WHEN** the user clicks the HvN checkbox to check it
- **THEN** the `buildCriteriaFromUI()` method is called
- **AND** HvN criteria is added to the criteriaList
- **AND** settings are saved via `saveSettings()`
- **AND** the search timer is reset via `syncSearchTimer({resetStart: true})`

#### Scenario: Unchecking HvN checkbox removes criteria

- **WHEN** the user clicks the HvN checkbox to uncheck it
- **THEN** the `buildCriteriaFromUI()` method is called
- **AND** HvN criteria is removed from the criteriaList
- **AND** settings are saved
- **AND** the search timer is reset

### Requirement: HvN Helper Functions

The system SHALL provide helper functions for HvN mode detection and normalization.

#### Scenario: Normalize "Humans Vs Nations" string

- **WHEN** `normalizeGameMode("humans vs nations")` is called
- **THEN** the function returns `'HvN'`

#### Scenario: Normalize "hvn" abbreviation

- **WHEN** `normalizeGameMode("hvn")` is called
- **THEN** the function returns `'HvN'`

#### Scenario: Detect HvN lobby via helper

- **WHEN** `isHvNLobby(lobby)` is called with a lobby where `gameConfig.gameMode === "Team"` and `gameConfig.playerTeams === "Humans Vs Nations"`
- **THEN** the function returns `true`

#### Scenario: Non-HvN lobby detection

- **WHEN** `isHvNLobby(lobby)` is called with a lobby where `gameConfig.playerTeams === "Duos"`
- **THEN** the function returns `false`

## MODIFIED Requirements

### Requirement: Game Mode Type Definition

The `gameMode` field type in `AutoJoinCriteria` SHALL be extended to include HvN.

#### Scenario: gameMode accepts three values

- **BEFORE**: `gameMode: 'FFA' | 'Team'`
- **AFTER**: `gameMode: 'FFA' | 'Team' | 'HvN'`
- **THEN** all three values are valid at compile time

### Requirement: normalizeGameMode Return Type

The `normalizeGameMode()` helper function return type SHALL include HvN as a possible return value.

#### Scenario: Function signature updated

- **BEFORE**: `function normalizeGameMode(...): 'FFA' | 'Team' | null`
- **AFTER**: `function normalizeGameMode(...): 'FFA' | 'Team' | 'HvN' | null`
- **THEN** TypeScript enforces exhaustive handling of HvN case

### Requirement: Criteria Matching Logic Extension

The `matchesCriteria()` method SHALL include HvN as a distinct matching branch.

#### Scenario: HvN matching branch added

- **BEFORE**: Method handles only `criteria.gameMode === 'FFA'` and `criteria.gameMode === 'Team'` cases
- **AFTER**: Method includes `criteria.gameMode === 'HvN'` case with specific playerTeams check
- **THEN** HvN criteria is processed through dedicated logic path
