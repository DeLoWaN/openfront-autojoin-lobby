/**
 * PlayerListUI - Main UI class for the player list feature
 *
 * Responsibilities:
 * - Render player list panel with clan grouping
 * - Monitor username input for clan tag changes
 * - Handle clan tag quick switching
 * - Manage panel dragging and resizing
 * - Subscribe to lobby updates and fetch game data
 */

import { STORAGE_KEYS } from '@/config/constants';
import { DragHandler } from '@/utils/DragHandler';
import { LobbyUtils } from '@/utils/LobbyUtils';
import { URLObserver } from '@/utils/URLObserver';
import { ClanLeaderboardCache } from '@/data/ClanLeaderboardCache';
import type { Lobby, PanelSize } from '@/types/game';
import type { PlayerListSettings, ClanGroup } from './PlayerListTypes';
import { DEFAULT_SETTINGS } from './PlayerListTypes';
import {
  getPlayerClanTag,
  groupPlayersByClan,
  findWorkerId,
  fetchGameData,
} from './PlayerListHelpers';

// Module-level variables for game tracking
let LAST_GAME_ID: string | null = null;
let LAST_WORKER_ID: number | null = null;

export class PlayerListUI {
  private settings: PlayerListSettings;
  private currentPlayers: string[] = [];
  private clanGroups: ClanGroup[] = [];
  private untaggedPlayers: string[] = [];
  private previousPlayers: Set<string> = new Set();
  private sleeping: boolean;
  private debugSequence: string[] = [];
  private showOnlyClans: boolean = true;
  private collapseStates: Map<string, boolean> = new Map();
  private recentTags: string[] = [];
  private usernameCheckInterval: ReturnType<typeof setInterval> | null = null;
  private usernameAttachInterval: ReturnType<typeof setInterval> | null = null;
  private debugKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private lastFetchedGameId: string | null = null;
  private lastFetchTime: number = 0;
  private fetchDebounceMs: number = 1500;
  private lastRenderedShowOnlyClans?: boolean;

  // DOM elements
  private container!: HTMLDivElement;
  private header!: HTMLDivElement;
  private debugInfo!: HTMLDivElement;
  private quickTagSwitch!: HTMLDivElement;
  private checkboxFilter!: HTMLDivElement;
  private content!: HTMLDivElement;
  private dragHandler!: DragHandler;
  private resizeObserver!: ResizeObserver;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.sleeping = !LobbyUtils.isOnLobbyPage();

    this.loadSettings();
    this.initUI();
    this.initDebugKey();
    this.updateSleepState();
    URLObserver.subscribe(() => this.updateSleepState());
    ClanLeaderboardCache.fetch();
  }

  /**
   * Receive lobby update from LobbyDataManager
   * Fetches game data and updates player list
   */
  async receiveLobbyUpdate(lobbies: Lobby[]): Promise<void> {
    if (this.sleeping) {
      return;
    }

    if (!lobbies || !lobbies.length) {
      LAST_GAME_ID = LAST_WORKER_ID = null;
      this.lastFetchedGameId = null;
      this.updateListWithNames([]);
      return;
    }

    const firstLobby = lobbies[0];
    if (!firstLobby) return;

    const gameId = firstLobby.gameID;
    const workerId = findWorkerId(gameId);

    // Anti-spam: Skip if same game and recently fetched
    const now = Date.now();
    if (
      this.lastFetchedGameId === gameId &&
      now - this.lastFetchTime < this.fetchDebounceMs
    ) {
      return; // Skip redundant fetch
    }

    // Update last fetch tracking
    this.lastFetchedGameId = gameId;
    this.lastFetchTime = now;

    LAST_GAME_ID = gameId;
    LAST_WORKER_ID = workerId;

    try {
      const data = await fetchGameData(gameId, workerId);
      const names = Object.values(data.clients || {}).map((st) => st.username);
      this.updateListWithNames(names);
    } catch (error) {
      console.warn('[PlayerList] Failed to fetch game data:', error);
      // Don't clear the list on error - keep showing last known state
    }
  }

  /**
   * Update the player list with new names
   * Only re-renders if players have changed
   */
  private updateListWithNames(names: string[]): void {
    this.currentPlayers = names;

    if (this.settings.debug && LAST_GAME_ID != null) {
      this.debugInfo.textContent = `GameID: ${LAST_GAME_ID} | WorkerID: ${LAST_WORKER_ID}`;
    }

    const nextPlayers = new Set(names);
    const samePlayers =
      this.previousPlayers &&
      this.previousPlayers.size === nextPlayers.size &&
      names.every((name) => this.previousPlayers.has(name));
    const sameFilter = this.lastRenderedShowOnlyClans === this.showOnlyClans;

    if (samePlayers && sameFilter) {
      return; // No changes
    }

    const { clanGroups, untaggedPlayers } = groupPlayersByClan(names);
    this.clanGroups = clanGroups;
    this.untaggedPlayers = untaggedPlayers;

    this.renderPlayerList();

    if (this.settings.showPlayerCount) {
      const countEl = this.header.querySelector('.of-player-list-count');
      if (countEl) {
        countEl.textContent = String(names.length);
      }
    }

    this.previousPlayers = nextPlayers;
    this.lastRenderedShowOnlyClans = this.showOnlyClans;
  }

  /**
   * Initialize UI elements and attach to DOM
   */
  private initUI(): void {
    this.container = document.createElement('div');
    this.container.className = 'of-panel of-player-list-container';
    document.body.appendChild(this.container);

    this.header = document.createElement('div');
    this.header.className = 'of-header of-player-list-header';
    this.header.innerHTML = `<span class="of-player-list-title">Players</span><span class="of-badge of-player-list-count">0</span>`;
    this.container.appendChild(this.header);

    this.debugInfo = document.createElement('div');
    this.debugInfo.className = 'of-player-debug-info';
    this.header.appendChild(this.debugInfo);

    this.quickTagSwitch = document.createElement('div');
    this.quickTagSwitch.className = 'of-quick-tag-switch';
    const quickTagLabel = document.createElement('span');
    quickTagLabel.className = 'of-quick-tag-label';
    quickTagLabel.textContent = 'Clan tag quick switch (last 5):';
    this.quickTagSwitch.appendChild(quickTagLabel);
    this.container.appendChild(this.quickTagSwitch);

    this.checkboxFilter = document.createElement('div');
    this.checkboxFilter.className = 'of-clan-checkbox-filter';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'show-only-clans-checkbox';
    checkbox.checked = this.showOnlyClans;
    checkbox.addEventListener('change', (e) => {
      this.showOnlyClans = (e.target as HTMLInputElement).checked;
      this.saveSettings();
      this.renderPlayerList();

      if (this.settings.showPlayerCount) {
        const countEl = this.header.querySelector('.of-player-list-count');
        if (countEl) {
          countEl.textContent = String(this.currentPlayers.length);
        }
      }
    });

    const label = document.createElement('label');
    label.htmlFor = 'show-only-clans-checkbox';
    label.textContent = 'Show only players with clan tags';

    this.checkboxFilter.appendChild(checkbox);
    this.checkboxFilter.appendChild(label);
    this.container.appendChild(this.checkboxFilter);

    this.content = document.createElement('div');
    this.content.className = 'of-content of-player-list-content';
    this.container.appendChild(this.content);

    this.dragHandler = new DragHandler(
      this.container,
      (x, y) => {
        this.container.style.left = x + 'px';
        this.container.style.top = y + 'px';
        this.container.style.right = 'auto';
      },
      STORAGE_KEYS.playerListPanelPosition
    );

    // Load saved panel size
    this.applySavedPanelSize();

    // Observe resize changes and save
    this.resizeObserver = new ResizeObserver(() => {
      if (!LobbyUtils.isOnLobbyPage()) {
        return;
      }
      const width = this.container.offsetWidth;
      const height = this.container.offsetHeight;
      if (width <= 0 || height <= 0) {
        return;
      }
      GM_setValue(STORAGE_KEYS.playerListPanelSize, { width, height });
    });
    this.resizeObserver.observe(this.container);

    this.applySettings();
    this.renderQuickTagSwitch();
    this.monitorUsernameInput();
  }

  /**
   * Monitor username input fields for clan tag changes
   * v0.29.0: Two separate inputs - clan tag (maxlength=5) and username
   */
  private monitorUsernameInput(): void {
    const findInputs = () => {
      const usernameInputComponent = document.querySelector('username-input');
      if (!usernameInputComponent) return null;

      const clanInput = usernameInputComponent.querySelector('input[maxlength="5"]');
      const nameInput = usernameInputComponent.querySelector('input:not([maxlength="5"])');

      return { clanInput, nameInput, component: usernameInputComponent };
    };

    let lastClanTag = '';
    let lastUsername = '';

    const checkUsername = () => {
      const inputs = findInputs();
      if (!inputs) return;

      const currentClanTag = (inputs.clanInput as HTMLInputElement)?.value || '';
      const currentUsername = (inputs.nameInput as HTMLInputElement)?.value || '';

      // Track clan tag changes
      if (currentClanTag !== lastClanTag && currentClanTag.length >= 2) {
        lastClanTag = currentClanTag;
        this.addRecentTag(currentClanTag);
      }

      // Track full username changes (for backwards compatibility)
      const fullUsername = currentClanTag
        ? `[${currentClanTag}] ${currentUsername}`
        : currentUsername;

      if (fullUsername !== lastUsername) {
        lastUsername = fullUsername;
        const tag = getPlayerClanTag(fullUsername);
        if (tag) {
          this.addRecentTag(tag);
        }
      }
    };

    // Check periodically
    this.usernameCheckInterval = setInterval(checkUsername, 1000);

    // Also attach input listeners
    const tryAttachListener = () => {
      const inputs = findInputs();
      const clanInput = inputs?.clanInput as HTMLInputElement | null;
      const nameInput = inputs?.nameInput as HTMLInputElement | null;

      if (clanInput && !(clanInput.dataset as any).ofMonitored) {
        (clanInput.dataset as any).ofMonitored = 'true';
        clanInput.addEventListener('input', checkUsername);
        clanInput.addEventListener('change', checkUsername);
      }
      if (nameInput && !(nameInput.dataset as any).ofMonitored) {
        (nameInput.dataset as any).ofMonitored = 'true';
        nameInput.addEventListener('input', checkUsername);
        nameInput.addEventListener('change', checkUsername);
      }
    };

    tryAttachListener();
    this.usernameAttachInterval = setInterval(tryAttachListener, 5000);
  }

  /**
   * Load settings from GM_storage
   */
  private loadSettings(): void {
    const saved = GM_getValue<boolean | string | undefined>(STORAGE_KEYS.playerListShowOnlyClans);
    if (saved !== undefined) {
      if (saved === 'true') {
        this.showOnlyClans = true;
      } else if (saved === 'false') {
        this.showOnlyClans = false;
      } else {
        this.showOnlyClans = !!saved;
      }
    }

    const savedCollapseStates = GM_getValue<Record<string, boolean> | undefined>(
      STORAGE_KEYS.playerListCollapseStates
    );
    if (savedCollapseStates) {
      this.collapseStates = new Map(Object.entries(savedCollapseStates));
    }

    const savedRecentTags = GM_getValue<string[] | undefined>(STORAGE_KEYS.playerListRecentTags);
    if (savedRecentTags && Array.isArray(savedRecentTags)) {
      this.recentTags = savedRecentTags;
    }
  }

  /**
   * Save settings to GM_storage
   */
  private saveSettings(): void {
    GM_setValue(STORAGE_KEYS.playerListShowOnlyClans, this.showOnlyClans);
  }

  /**
   * Save collapse states to GM_storage
   */
  private saveCollapseStates(): void {
    const obj = Object.fromEntries(this.collapseStates);
    GM_setValue(STORAGE_KEYS.playerListCollapseStates, obj);
  }

  /**
   * Apply clan tag to the username input field
   * v0.29.0: Use the separate clan tag input (maxlength="5")
   */
  private applyClanTagToNickname(tag: string): void {
    const usernameInputComponent = document.querySelector('username-input');
    if (!usernameInputComponent) {
      return;
    }

    const clanInput = usernameInputComponent.querySelector('input[maxlength="5"]') as HTMLInputElement;
    if (clanInput) {
      const upperTag = tag.toUpperCase();
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )?.set;

      if (setter) {
        setter.call(clanInput, upperTag);
        clanInput.dispatchEvent(new Event('input', { bubbles: true }));
        clanInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  /**
   * Add a clan tag to recent tags list
   * Keeps only the last 5 unique tags
   */
  private addRecentTag(tag: string): void {
    const upper = tag.toUpperCase();
    this.recentTags = this.recentTags.filter((t) => t !== upper);
    this.recentTags.unshift(upper);
    if (this.recentTags.length > 5) {
      this.recentTags = this.recentTags.slice(0, 5);
    }
    GM_setValue(STORAGE_KEYS.playerListRecentTags, this.recentTags);
    this.renderQuickTagSwitch();
  }

  /**
   * Render the quick tag switch buttons
   */
  private renderQuickTagSwitch(): void {
    // Remove old buttons
    const oldButtons = this.quickTagSwitch.querySelectorAll('.of-quick-tag-btn');
    oldButtons.forEach((btn) => btn.remove());

    // Add buttons for recent tags
    for (const tag of this.recentTags) {
      const btn = document.createElement('button');
      btn.className = 'of-quick-tag-btn';
      btn.textContent = tag;
      btn.title = `Apply [${tag}] to your username`;
      btn.addEventListener('click', () => {
        this.applyClanTagToNickname(tag);
      });

      const removeBtn = document.createElement('span');
      removeBtn.textContent = ' ×';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.marginLeft = '4px';
      removeBtn.title = 'Remove from recent tags';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.recentTags = this.recentTags.filter((t) => t !== tag);
        GM_setValue(STORAGE_KEYS.playerListRecentTags, this.recentTags);
        this.renderQuickTagSwitch();
      });

      btn.appendChild(removeBtn);
      this.quickTagSwitch.appendChild(btn);
    }
  }

  /**
   * Toggle collapse state of a clan group
   */
  private toggleClanGroup(clanTag: string, groupEl: HTMLElement): void {
    const playersEl = groupEl.querySelector('.of-clan-group-players') as HTMLElement;
    const arrowEl = groupEl.querySelector('.of-clan-arrow') as HTMLElement;
    const isExpanded = !groupEl.classList.contains('collapsed');

    if (isExpanded) {
      groupEl.classList.add('collapsed');
      arrowEl.textContent = '►';
      this.collapseStates.set(clanTag.toLowerCase(), true);
      if (this.settings.animationsEnabled) {
        playersEl.style.maxHeight = playersEl.scrollHeight + 'px';
        requestAnimationFrame(() => {
          playersEl.style.maxHeight = '0';
        });
      } else {
        playersEl.style.display = 'none';
      }
    } else {
      groupEl.classList.remove('collapsed');
      arrowEl.textContent = '▼';
      this.collapseStates.set(clanTag.toLowerCase(), false);
      if (this.settings.animationsEnabled) {
        playersEl.style.maxHeight = playersEl.scrollHeight + 'px';
        const handler = () => {
          playersEl.style.maxHeight = 'none';
          playersEl.removeEventListener('transitionend', handler);
        };
        playersEl.addEventListener('transitionend', handler);
      } else {
        playersEl.style.display = '';
      }
    }

    this.saveCollapseStates();
  }

  /**
   * Create a clan group element with header and players
   */
  private createClanGroupEl(tag: string, players: string[], stats: any): HTMLElement {
    const groupEl = document.createElement('div');
    groupEl.className = 'of-clan-group';
    (groupEl.dataset as any).clanTag = tag;

    const headerEl = document.createElement('div');
    headerEl.className = 'of-clan-group-header';

    let statsHtml = '';
    if (stats) {
      const ratio =
        stats.wins && stats.losses
          ? (stats.wins / stats.losses).toFixed(2)
          : stats.weightedWLRatio?.toFixed(2) || '0.00';
      statsHtml = `
        <span>Wins: ${stats.wins?.toLocaleString() || 0}</span>
        <span>•</span>
        <span>Losses: ${stats.losses?.toLocaleString() || 0}</span>
        <span>•</span>
        <span>Ratio: ${ratio}</span>
      `;
    }

    headerEl.innerHTML = `
      <span class="of-clan-arrow">▼</span>
      <span class="of-clan-tag">[${tag}]</span>
      <span class="of-clan-count">${players.length}</span>
      <div class="of-clan-actions">
        ${statsHtml ? `<div class="of-clan-stats">${statsHtml}</div>` : ''}
        <button class="of-clan-use-btn" title="Apply [${tag}] to your username">Use</button>
      </div>
    `;

    headerEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('of-clan-use-btn')) {
        this.toggleClanGroup(tag, groupEl);
      }
    });

    const useBtn = headerEl.querySelector('.of-clan-use-btn');
    if (useBtn) {
      useBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.applyClanTagToNickname(tag);
      });
    }

    const playersEl = document.createElement('div');
    playersEl.className = 'of-clan-group-players';

    for (const player of players) {
      playersEl.appendChild(this.createPlayerEl(player));
    }

    groupEl.appendChild(headerEl);
    groupEl.appendChild(playersEl);

    // Restore collapse state
    const isCollapsed = this.collapseStates.get(tag.toLowerCase());
    if (isCollapsed) {
      groupEl.classList.add('collapsed');
      headerEl.querySelector('.of-clan-arrow')!.textContent = '►';
      playersEl.style.maxHeight = '0';
    }

    return groupEl;
  }

  /**
   * Create a player element
   */
  private createPlayerEl(name: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'of-player-item';

    const nameEl = document.createElement('span');
    nameEl.className = 'of-player-name';
    nameEl.textContent = name;

    el.appendChild(nameEl);
    return el;
  }

  /**
   * Render the complete player list
   */
  private renderPlayerList(): void {
    this.content.innerHTML = '';

    // Render clan groups
    for (const group of this.clanGroups) {
      const stats = ClanLeaderboardCache.getStats(group.tag);
      const groupEl = this.createClanGroupEl(group.tag, group.players, stats);
      this.content.appendChild(groupEl);
    }

    // Render untagged players if filter is off
    if (!this.showOnlyClans) {
      for (const player of this.untaggedPlayers) {
        this.content.appendChild(this.createPlayerEl(player));
      }
    }
  }

  /**
   * Apply settings to UI
   */
  private applySettings(): void {
    if (this.settings.debug) {
      this.debugInfo.style.display = 'block';
    }
  }

  /**
   * Apply saved panel size from storage
   */
  private applySavedPanelSize(): void {
    const saved = GM_getValue<PanelSize | undefined>(STORAGE_KEYS.playerListPanelSize);
    if (saved && saved.width && saved.height) {
      this.container.style.width = saved.width + 'px';
      this.container.style.height = saved.height + 'px';
    }
  }

  /**
   * Update sleep state based on current page
   * Hide panel when in-game, show when in lobby
   */
  private updateSleepState(): void {
    const onLobby = LobbyUtils.isOnLobbyPage();
    this.sleeping = !onLobby;

    if (this.sleeping) {
      this.container.classList.add('hidden');
    } else {
      this.container.classList.remove('hidden');
    }
  }

  /**
   * Initialize debug key handler (Ctrl+Shift+D to toggle debug mode)
   */
  private initDebugKey(): void {
    this.debugKeyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.debugSequence.push('D');
        if (this.debugSequence.length > 3) this.debugSequence.shift();
        if (this.debugSequence.join('') === 'DDD') {
          this.settings.debug = !this.settings.debug;
          this.applySettings();
          console.log('[PlayerList] Debug mode:', this.settings.debug);
          this.debugSequence = [];
        }
      }
    };
    document.addEventListener('keydown', this.debugKeyHandler);
  }

  /**
   * Cleanup when removing the module
   */
  cleanup(): void {
    if (this.usernameCheckInterval) {
      clearInterval(this.usernameCheckInterval);
    }
    if (this.usernameAttachInterval) {
      clearInterval(this.usernameAttachInterval);
    }
    if (this.debugKeyHandler) {
      document.removeEventListener('keydown', this.debugKeyHandler);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.dragHandler) {
      this.dragHandler.destroy();
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
