## Purpose
Keep naming and user-facing language aligned with notification/manual discovery terminology.

## Requirements

### Requirement: User-Facing Terminology Uses Notification/Manual-Join Language
User-visible labels, headings, status text, and help text MUST describe the feature as notification/manual discovery and MUST NOT describe it as auto-join.

#### Scenario: Panel is displayed
- **WHEN** the user views the lobby discovery panel
- **THEN** visible copy SHALL use notification/manual-join terminology and SHALL NOT include "Auto-Join"

#### Scenario: Discovery state changes
- **WHEN** discovery status transitions between enabled and disabled states
- **THEN** status labels SHALL communicate notification discovery state without auto-join wording

### Requirement: DOM Selectors and CSS Hooks Are Renamed
DOM IDs/classes and corresponding style hooks that currently encode auto-join naming MUST be renamed to notification/manual-discovery naming.

#### Scenario: UI is inspected after render
- **WHEN** discovery UI elements are present in the DOM
- **THEN** IDs/classes used for core discovery controls SHALL use renamed notification-oriented prefixes

### Requirement: Module and Symbol Naming Is Renamed in Source
Source file names, class names, and imports for the discovery module MUST be renamed from auto-join naming to notification/manual-discovery naming.

#### Scenario: Build-time imports are resolved
- **WHEN** the project is type-checked and built after the refactor
- **THEN** code references SHALL resolve through the renamed module/class/file paths without auto-join symbol names
