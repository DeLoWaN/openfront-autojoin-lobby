
# OpenFront.io Bundle: Player List + Auto-Join

## Project Overview

This userscript enhances the OpenFront.io gaming experience by providing real-time lobby information and automated game joining capabilities. It combines two essential features - a comprehensive player list viewer and an intelligent auto-join system - into a single, efficient tool that works seamlessly with the OpenFront.io platform.

**Requirements:** OpenFront.io v0.29.0+

The userscript is built from modular TypeScript source files in the root directory and compiled to `dist/bundle.user.js` for distribution. The main repository contains the game OpenFront.io, also accessible at https://openfront.io.

---

## Development Architecture

### Modular TypeScript Codebase

The userscript has been refactored from a monolithic 2,805-line JavaScript file into a **modern, modular TypeScript architecture** for improved maintainability and AI-assisted development.

#### Build System

- **Language**: TypeScript 5.3+ with strict mode enabled
- **Bundler**: esbuild for fast, efficient compilation
- **Testing**: Vitest with JSDOM environment
- **Output**: Production bundle size varies by feature set (currently ~106KB)

#### Directory Structure

```
.
├── src/                      # Source code (TypeScript)
│   ├── config/              # Configuration and constants
│   │   ├── constants.ts     # CONFIG, STORAGE_KEYS, Z_INDEX
│   │   ├── clanColors.ts    # OpenFront team palettes + color ordering
│   │   └── theme.ts         # COLORS, SPACING, design tokens
│   ├── types/               # TypeScript type definitions
│   │   ├── game.d.ts        # Lobby, GameConfig interfaces
│   │   └── greasemonkey.d.ts # GM_* API declarations
│   ├── styles/              # CSS-in-JS styles
│   │   └── styles.ts        # Complete UI styling
│   ├── utils/               # Utility functions
│   │   ├── DragHandler.ts   # Draggable panel system
│   │   ├── URLObserver.ts   # SPA navigation detection
│   │   ├── LobbyUtils.ts    # Lobby interaction helpers
│   │   └── SoundUtils.ts    # Audio notification system
│   │   └── TeamColorAllocator.ts # OpenFront color allocator + deltaE matching
│   ├── data/                # Data management layer
│   │   ├── LobbyDataManager.ts        # WebSocket + HTTP fallback
│   │   └── ClanLeaderboardCache.ts    # Clan stats caching
│   ├── modules/             # Feature modules
│   │   ├── player-list/     # Player list module
│   │   │   ├── PlayerListTypes.ts
│   │   │   ├── PlayerListHelpers.ts
│   │   │   └── PlayerListUI.ts
│   │   └── auto-join/       # Auto-join module
│   │       ├── AutoJoinTypes.ts
│   │       ├── AutoJoinHelpers.ts
│   │       ├── AutoJoinEngine.ts
│   │       └── AutoJoinUI.ts
│   └── main.ts              # Entry point, module initialization
├── tests/                   # Test files (Vitest)
├── dist/                    # Build output (bundle.user.js)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── esbuild.config.js        # Build configuration
└── vitest.config.js         # Test configuration
```

#### Architecture Layers

The codebase follows a **layered architecture** with unidirectional dependencies:

1. **Config Layer** - Constants and theme tokens
2. **Types Layer** - TypeScript interfaces and type definitions
3. **Styles Layer** - CSS-in-JS using theme tokens
4. **Utils Layer** - Pure utility functions and helpers
5. **Data Layer** - WebSocket/HTTP data fetching with subscriber pattern
6. **Modules Layer** - Feature modules (PlayerList, AutoJoin)
7. **Main Layer** - Entry point that wires everything together

#### Development Workflow

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Production build
npm run build:prod

# Run tests
npm test

# Type checking
npm run type-check
```

#### Key Architectural Decisions

- **Path Aliases**: Use `@/` prefix for clean imports (e.g., `import { CONFIG } from '@/config/constants'`)
- **No Circular Dependencies**: Strict unidirectional dependency flow
- **Pure Functions**: Helpers and utilities are side-effect-free for testability
- **Subscriber Pattern**: Data layer uses pub/sub for loose coupling between modules
- **Backwards Compatible**: Maintains existing GM_storage keys for user settings
- **Type Safety**: Full TypeScript strict mode with comprehensive type definitions
- **Color Matching**: Team assignment + color allocation mirror OpenFront lobby preview rules

#### Module Overview

**PlayerList Module** ([src/modules/player-list/](src/modules/player-list/)):
- `PlayerListTypes.ts` - Type definitions for settings and clan groups
- `PlayerListHelpers.ts` - Pure functions for player grouping, clan tag extraction, team assignment
- `PlayerListUI.ts` - UI class with 21 methods handling rendering and interactions

**AutoJoin Module** ([src/modules/auto-join/](src/modules/auto-join/)):
- `AutoJoinTypes.ts` - Criteria, settings, and join mode types
- `AutoJoinHelpers.ts` - Game mode normalization and lobby analysis
- `AutoJoinEngine.ts` - Core matching logic (pure function approach)
- `AutoJoinUI.ts` - UI class with 30+ methods for auto-join interface

**Data Layer** ([src/data/](src/data/)):
- `LobbyDataManager.ts` - WebSocket connection with automatic HTTP fallback, subscriber pattern
- `ClanLeaderboardCache.ts` - Fetches clan stats once per session with retry logic

#### For AI Assistants

When working with this codebase:
- Each module is self-contained with clear responsibilities
- Files are typically under 500 lines for easier context windows
- Use path aliases (`@/`) when importing
- Follow the existing layer architecture
- Pure functions in `*Helpers.ts` files are easiest to modify
- UI classes in `*UI.ts` files handle DOM interactions
- Run `npm test` before committing changes
- See [README.md](README.md) for detailed technical documentation

---

## Core Features

### 1. Live Player List

Track and organize players in your current lobby with real-time updates:

- **Real-Time Player Tracking**: Automatically displays all players currently in your lobby as they join or leave
- **Clan Organization**: Groups players by their clan tags, making it easy to identify team compositions at a glance
- **Clan Statistics**: Shows win/loss ratios and performance metrics for recognized clans from the OpenFront leaderboard
- **Team-Based Clan Colors**: Clans share the same color they will receive in OpenFront team games
- **You Badge**: Your clan group is marked with a "You" badge without overriding team color
- **Active Clan Pinning**: Keeps your current clan group at the top based on your selected clan tag
- **Player Count Display**: Shows total number of players in the lobby
- **Collapsible Groups**: Expand or collapse clan groups to manage screen space

### 2. Quick Clan Tag Switching

Rapidly switch between different clan identities:

- **Recent Tags Memory**: Automatically remembers your last 3 used clan tags
- **One-Click Switching**: Apply any recent clan tag to your username with a single click
- **Auto-Rejoin Toggle**: Optionally rejoin the lobby automatically when switching clan tags; the toggle lives in the auto-join panel
- **Tag Management**: Remove clan tags from your recent list if no longer needed

### 3. Intelligent Auto-Join System

Automatically find and join games matching your preferences:

- **Dual Mode Operation**: 
  - **Auto-Join Mode**: Automatically joins lobbies matching your criteria
  - **Notify Mode**: Alerts you when matching games are found, letting you join manually
- **Clanmate Auto-Join**: One-shot button arms a clanmate watcher and joins when a matching clan tag appears, independent of auto-join mode
- **Game Mode Filtering**: Search for Free-For-All (FFA) or Team games independently
- **Player Capacity Filtering**: 
  - For FFA: Filter by total max players (e.g., only join 20+ player games)
  - For Team: Filter by players per team (e.g., only join games with 3-5 players per team)
- **Team Configuration Options**: Choose specific team formats:
  - Preset formats: Duos, Trios, Quads
  - Custom team counts: 2-7 teams
  - Flexible "3× min players" constraint for team size filtering
- **Search Timer**: Tracks how long you've been searching and when a match was found
- **Visual Notifications**: Large, dismissible notifications when matching games are found
- **Sound Alerts**: Optional audio notifications for game found and game start events
- **Current Game Info**: Shows details about the active lobby to help you decide if you want to stay

### 4. Smart Lobby Management

Handles lobby interactions intelligently:

- **WebSocket Connection**: Uses real-time WebSocket updates for instant lobby information
- **HTTP Fallback**: Automatically falls back to polling if WebSocket connection fails
- **Debounced Actions**: Prevents rapid-fire lobby join/leave actions that could cause issues
- **State Verification**: Verifies lobby join/leave actions completed successfully
- **URL-Aware**: Detects when you navigate between lobby and in-game views
- **Auto-Hide**: Panels hide during gameplay and reappear when you return to lobby

### 5. Customizable Interface

Tailor the experience to your preferences:

- **Docked Player List Sidebar**: Player list sits as a right-side sidebar that reflows game content
- **Resizable Player List**: Drag the left-edge handle to set the player list width
- **Draggable Auto-Join Panel**: Move the auto-join panel anywhere on screen to suit your layout
- **Persistent Layout**: Auto-join position and player list width are saved between sessions
- **Filter Options**: 
  - Toggle showing only players with clan tags
  - Control auto-rejoin on clan tag apply from the auto-join panel
- **Auto-Join Status Placement**: Status indicators sit next to the sound toggle in the auto-join panel footer so the main mode button keeps its width
- **Visual Design**: Modern, semi-transparent panels with clean typography and smooth animations
- **Collapse States Memory**: Remembers which clan groups you had collapsed

---

## User Workflows

### Finding Your Clan in a Lobby

1. Join any public lobby
2. The player list panel automatically appears on the right side
3. Players are grouped by clan tag with statistics
4. Your clan appears highlighted if you're using a clan tag
5. Expand/collapse clan groups to focus on relevant information

### Switching Between Clan Identities

1. Look at the "Tag quick switch" section at the top of the player list
2. Click any of your recent clan tags (last 3 are saved)
3. Your username is instantly updated with the new clan tag
4. Optionally, the system rejoins the lobby to reflect your new identity
5. Remove unwanted tags using the "x" button

### Auto-Joining Specific Game Types

1. Configure your preferences in the Auto-Join panel:
   - Enable FFA and/or Team mode
   - Set minimum/maximum player counts
   - For Team games, optionally select specific team counts
2. The system searches for matching lobbies automatically
3. When a match is found:
   - **Auto-Join Mode**: Instantly joins the lobby
   - **Notify Mode**: Shows a notification with game details
4. View search duration and game information in real-time

### Monitoring Game Capacity

1. Enable Team mode in the Auto-Join panel
2. The "Current game" info shows:
   - Game mode (FFA, Duos, Trios, Quads, etc.)
   - Players per team for custom team configurations
   - Total team count
3. Use this to decide if you want to stay in the current lobby

---

## Feature Interactions

### Player List + Clan Tag Switching

- The player list automatically adds any clan tag you type into the username field to your recent tags
- Switching clan tags can optionally rejoin the lobby, updating your position in the player list groups
- The player list highlights and pins your current clan group based on the active clan tag
- Team games assign clan colors based on the same OpenFront team preview logic

### Auto-Join + Player List

- Both features use the same lobby data source for efficiency
- The player list updates in real-time as Auto-Join finds and joins lobbies
- Clanmate auto-join watches player list updates and can trigger a join even when auto-join is inactive or notify-only
- Current game info in Auto-Join helps you understand the player composition shown in the player list

### WebSocket + Polling

- The system attempts to use WebSocket for real-time updates
- If WebSocket fails (3 connection attempts), automatically falls back to HTTP polling
- Both features benefit from the shared lobby data regardless of connection method

---

## Settings Persistence

All user preferences are automatically saved:

- Auto-join criteria (game modes, player counts, team configurations)
- Auto-join panel position on screen
- Player list panel size
- Sound notification preference
- Filter toggle states (show only clans)
- Collapsed clan groups
- Recent clan tags (last 3)
- Auto-join enabled/disabled state
- Join mode (auto-join vs notify)
- Auto rejoin on clan tag apply (stored with auto-join settings and migrated from the legacy player-list key)

---

## Visual Feedback

The userscript provides clear visual indicators:

- **Clan color accents**: Headers and player pills use team-based colors
- **You badge**: Marks your clan without overriding its team color
- **Animated notifications**: Full-screen notifications when games are found
- **Search timer**: Live countdown showing how long you've been searching
- **Status indicators**: Shows whether auto-join is active or inactive
- **Player animations**: Smooth transitions for player and clan group joins/leaves (with staggered entry)
- **Sound notifications**: Audio alerts when games are found (optional)

---

## Project Context

This userscript is designed specifically for OpenFront.io gameplay and integrates with:

- The OpenFront.io public lobby system
- OpenFront.io game configuration API
- OpenFront.io clan leaderboard API
- Tampermonkey/Greasemonkey browser extension

The code is a collaborative effort by DeLoVaN, SyntaxMenace, DeepSeek, and Claude.

# Version Management

The version number is centralized in `package.json` and automatically propagates to:
- `package-lock.json` (via `npm install`)
- `dist/bundle.user.js` userscript header (via build process)

## How to Upgrade Version

When completing a new OpenSpec proposal or making a release:

1. **Update version in package.json**:
   ```bash
   npm version patch   # Bug fixes (2.5.0 → 2.5.1)
   npm version minor   # New features (2.5.0 → 2.6.0)
   npm version major   # Breaking changes (2.5.0 → 3.0.0)
   ```

2. **Rebuild the production bundle**:
   ```bash
   npm run build:prod
   ```

3. **Verify version consistency**:
   ```bash
   grep '"version"' package.json
   grep '@version' dist/bundle.user.js
   ```

The `npm version` command automatically updates `package-lock.json`. The build process reads the version from `package.json` and injects it into the userscript header.

**Note**: Always run `npm run build:prod` after version changes to ensure the bundle reflects the new version.
