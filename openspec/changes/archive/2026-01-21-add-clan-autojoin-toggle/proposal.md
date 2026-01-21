# Change: Add Clan Member Auto-Join and Panel Controls

## Why
Players want to instantly join the lobby when a clanmate appears, and related settings should live in the auto-join panel to keep lobby behavior controls in one place.

## What Changes
- Add a clan-member auto-join one-shot button that joins the lobby when the player list shows a matching clan tag (independent of auto-join active/notify mode).
- Move the "auto rejoin lobby when applying clan tag" toggle into the auto-join panel and persist it with auto-join settings.
- Reposition auto-join status indicators next to the sound toggle without shrinking the main mode button.

## Impact
- Affected specs: auto-join, player-list
- Affected code: src/modules/auto-join/AutoJoinUI.ts, src/modules/player-list/PlayerListUI.ts, src/styles/styles.ts, src/config/constants.ts
