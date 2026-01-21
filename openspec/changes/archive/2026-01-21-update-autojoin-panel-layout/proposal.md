# Change: Embed Auto-Join Panel in Player List Column

## Why
The auto-join panel currently floats independently and consumes vertical space without aligning to the right-side player list. Embedding it in the player list column improves spatial coherence and frees vertical room for the player list when collapsed.

## What Changes
- Embed the auto-join panel inside the right-side player list column and align its width with the player list panel.
- Rework the auto-join layout to be wider and shorter (compact, horizontal grouping).
- Add a simple collapse control to hide/show the auto-join panel and reclaim player list space (reset to expanded on page load).
- Preserve existing auto-join functionality and criteria behavior.

## Impact
- Affected specs: autojoin-panel
- Affected code: src/modules/auto-join/AutoJoinUI.ts, src/modules/player-list/PlayerListUI.ts, src/styles/styles.ts, src/main.ts
