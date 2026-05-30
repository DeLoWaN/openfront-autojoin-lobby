# Implementation Tasks

## 1. Helper Function

- [x] 1.1 Add `stripClanTag()` function to [src/modules/player-list/PlayerListHelpers.ts](../../src/modules/player-list/PlayerListHelpers.ts)
- [x] 1.2 Write unit tests for `stripClanTag()` covering edge cases
- [x] 1.3 Verify TypeScript compilation passes

## 2. UI Logic Updates

- [x] 2.1 Update `createPlayerEl()` signature to accept `isInClanGroup: boolean` parameter
- [x] 2.2 Update `createPlayerEl()` implementation to strip clan tag when `isInClanGroup` is true
- [x] 2.3 Update call site in `createClanGroupEl()` to pass `isInClanGroup: true`
- [x] 2.4 Update call sites in `renderPlayerListFull()` for untagged players to pass `isInClanGroup: false`
- [x] 2.5 Update call sites in `renderPlayerListDifferential()` for both contexts

## 3. CSS Styling

- [x] 3.1 Update `.of-clan-group-players` to use horizontal flexbox with wrapping
- [x] 3.2 Add pill/box styling for `.of-clan-group-players .of-player-item`
- [x] 3.3 Ensure base `.of-player-item` styles preserved for untagged players
- [x] 3.4 Verify hover states work with new box styling
- [x] 3.5 Verify current player clan highlighting still works

## 4. Testing & Verification

- [x] 4.1 Manual test with 1-5 players in clan group
- [x] 4.2 Manual test with 10-20 players in clan group
- [x] 4.3 Manual test with 30+ players in clan group
- [x] 4.4 Verify player join/leave animations work correctly
- [x] 4.5 Verify stagger animations look good in horizontal layout
- [x] 4.6 Test with very long usernames (boxes should expand)
- [x] 4.7 Test panel resizing with various widths
- [x] 4.8 Verify current player's clan highlighting
- [x] 4.9 Check no console errors or warnings
- [x] 4.10 Verify TypeScript strict mode compilation passes

## 5. Polish

- [x] 5.1 Adjust spacing/padding if needed for visual balance
- [x] 5.2 Verify design matches existing aesthetic
- [x] 5.3 Test in production build (`npm run build:prod`)
