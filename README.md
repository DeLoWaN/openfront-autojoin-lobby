# OpenFrontIO Auto-Join Lobby

A Tampermonkey/Greasemonkey userscript that automatically joins lobbies on OpenFront.io based on your game mode preferences and game capacity filters.

## Disclaimer

**This script has been entirely written by AI.** Use at your own discretion. The script is provided as-is without any warranties or guarantees.

### Compatibility

Tested and 100% functional against OpenFront v0.26.16

## Features

- **Game Mode Support**
  - **FFA (Free For All)**: Auto-join Free For All lobbies
  - **Team Mode**: Auto-join Team lobbies with support for:
    - Duos (2 players per team)
    - Trios (3 players per team)
    - Quads (4 players per team)
    - 2-7 teams configurations
    - All team configurations (when no specific team count is selected)

- **Game Capacity Filters**
  - Filter lobbies based on game capacity (maximum players the game can hold)
  - Visual range sliders for easy min/max capacity selection (1-100 players)
  - Minimum capacity filter: Only join games that can hold at least X players
  - Maximum capacity filter: Only join games that can hold at most X players
  - Filters can be set independently for FFA and Team modes
  - If capacity information is unavailable, the filter is bypassed (allows join)

- **Smart Auto-Join**
  - Automatically disables when returning to lobby (prevents immediate rejoin)
  - Visual feedback with search timer
  - Status indicators (Active/Inactive/Joined)

- **User Interface**
  - Draggable panel (position is saved)
  - Toggle ON/OFF button
  - Visual range sliders for capacity filtering with live value display
  - Real-time search timer display
  - Settings persistence across page reloads
  - Clean, modern dark theme UI

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari)
   - [Greasemonkey](https://www.greasespot.net/) (Firefox)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

2. Install the script:
   - Open `openfront-autojoin.user.js` in your browser
   - Your userscript manager should detect it and prompt you to install
   - Or copy the script content and create a new script in your userscript manager

3. Navigate to [OpenFront.io](https://openfront.io/) and the Auto-Join panel should appear in the top-right corner

## Usage

### Basic Setup

1. **Select Game Mode(s)**
   - Check the "FFA (Free For All)" checkbox to enable FFA auto-join
   - Check the "Team" checkbox to enable Team mode auto-join

2. **Configure Team Counts (Optional)**
   - If Team mode is selected, you can optionally specify which team configurations to join
   - Use "Select All" / "Deselect All" buttons for quick selection
   - If no team counts are selected, the script will join any Team mode lobby

3. **Set Game Capacity Filters (Optional)**
   - Use the visual range sliders to set minimum and maximum game capacity
   - Drag the sliders to adjust the range (1-100 players)
   - The displayed values show "Any" when set to the full range (min: 1, max: 100)
   - Only games with capacity within your selected range will be joined
   - If you set both sliders to the full range (Any/Any), all matching game modes will be joined

4. **Enable Auto-Join**
   - Click the "OFF" button to toggle it to "ON"
   - The script will start searching for matching lobbies
   - A search timer will display how long you've been searching

### Status Indicators

- **Red indicator**: Auto-join is OFF (Inactive)
- **Green pulsing indicator**: Auto-join is ON (Active/Searching)
- **Status text**: Shows "Inactive", "Active", or "Joined"
- **Search timer**: Displays search duration or time when game was found

### Panel Controls

- **Drag**: Click and drag the header to move the panel around
- **Toggle**: Click the ON/OFF button to enable/disable auto-join
- **Settings**: All settings are automatically saved and restored on page reload

## Configuration

The script uses the following default configuration:

```javascript
pollInterval: 1000ms  // How often to check for matching lobbies
rootURL: 'https://openfront.io/'  // Root URL for lobby detection
```

These can be modified in the script's `CONFIG` object if needed.

## Behavior

- **Auto-disable on game start**: When you enter a game, auto-join automatically turns OFF
- **Auto-disable on lobby return**: When you return to the lobby, auto-join automatically turns OFF (prevents immediate rejoin)
- **Auto-restart on lobby leave**: When you leave a lobby (via leave-lobby event), auto-join restarts searching if it was enabled
- **Always starts OFF**: Auto-join always starts in the OFF state, even if it was enabled when you last visited
- **Settings persistence**: Your game mode preferences and capacity filters are saved and restored
- **Panel position**: The panel's position is saved and restored

## Technical Details

- **Storage**: Uses Tampermonkey's `GM_setValue`/`GM_getValue` for settings persistence
- **Lobby Detection**: Monitors the `public-lobby` web component for available lobbies
- **Capacity Filtering**: Filters based on game capacity (`maxClients`, `config.maxClients`, or `config.maxPlayers` properties)
- **Join Method**: Clicks the join button programmatically (provides visual feedback)
- **URL Detection**: Uses URL-based detection to determine game state (lobby vs. in-game)
- **Polling**: Checks for matching lobbies every 1 second when enabled
- **UI Components**: Uses HTML5 range sliders with visual track fill for capacity selection

## Version

Current version: **1.2.0**

## Author

DeLoVaN

## License

This userscript is provided as-is for personal use.
