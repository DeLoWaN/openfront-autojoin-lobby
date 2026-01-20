# Project Context

## Purpose
Provide a userscript that enhances OpenFront.io with real-time lobby intelligence (player list, clan grouping, stats) and an automated/notify-based lobby auto-join system, packaged as a single bundle for Tampermonkey/Greasemonkey.

## Tech Stack
- TypeScript 5.3+ (strict mode)
- esbuild bundler
- Vitest + JSDOM for tests
- Node.js 18+ for tooling
- Tampermonkey/Greasemonkey GM_* APIs (userscript runtime)
- CSS-in-JS styling in TypeScript

## Project Conventions

### Code Style
- Named exports only (no default exports).
- Use `@/` path aliases for imports.
- Keep files focused (target <500 lines).
- Helpers in `*Helpers.ts` are pure/side-effect-free where possible.
- Avoid circular dependencies; follow layer boundaries.

### Architecture Patterns
- Layered architecture with unidirectional dependencies: config/types → styles → utils → data → modules → main.
- Data layer uses pub/sub with WebSocket + HTTP fallback for lobby data.
- UI classes own DOM interactions; helpers hold core logic.
- Backwards-compatible GM_storage keys for settings.

### Testing Strategy
- Unit tests in `tests/` mirror `src/` structure.
- Vitest with JSDOM environment.
- Run `npm test` and `npm run type-check` before commits when possible.

### Git Workflow
- No explicit branching or commit message conventions documented in this repo.
- Keep commits focused and run tests before committing when practical.

## Domain Context
This is a userscript for OpenFront.io lobbies (OpenFront.io v0.29.0+). It augments the lobby experience with a player list, clan grouping/leaderboard stats, quick clan-tag switching, and auto-join/notify logic for FFA and team lobbies.

## Important Constraints
- Userscript runtime (Tampermonkey/Greasemonkey) must remain compatible.
- Source of truth is `src/`; bundle output is `dist/bundle.js` via esbuild.
- Maintain strict TypeScript type safety and layer boundaries.
- Preserve existing storage keys to avoid breaking user settings.

## External Dependencies
- OpenFront.io lobby and game configuration APIs (WebSocket + HTTP).
- OpenFront.io clan leaderboard API.
- Tampermonkey/Greasemonkey GM_* APIs.
