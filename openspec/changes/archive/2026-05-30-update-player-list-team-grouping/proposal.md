# Change: Team-Grouped Player List in Team Mode

## Why
Players need clearer separation by team while preserving clan stats and quick tag actions. Team-level grouping improves scanability and keeps team context visible without sacrificing existing clan UI features.

## What Changes
- Group clan groups and solo players under team headers in Team mode
- Float the current player's team to the top of the team list
- Keep clan cards neutral; apply team color only to team headers/bands
- Preserve existing player pill layout with full names
- In FFA, keep existing clan grouping but color solo players per-player (stable pseudo-random)
- Respect "Show only players with clan tags" by hiding solo players and empty teams

## Impact
- Affected specs: player-list
- Affected code: src/modules/player-list/PlayerListUI.ts, src/modules/player-list/PlayerListHelpers.ts, src/modules/player-list/PlayerListTypes.ts, src/styles/styles.ts
