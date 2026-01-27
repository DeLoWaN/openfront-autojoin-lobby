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
import { FALLBACK_COLORS, HUMAN_COLORS, type RGB } from '@/config/clanColors';
import { ResizeHandler } from '@/utils/ResizeHandler';
import { LobbyUtils } from '@/utils/LobbyUtils';
import { URLObserver } from '@/utils/URLObserver';
import { ClanLeaderboardCache } from '@/data/ClanLeaderboardCache';
import type { Lobby, PanelSize, GameConfig } from '@/types/game';
import { ColorAllocator, TeamColorAllocator, rgbToCss, rgbaToCss } from '@/utils/TeamColorAllocator';
import type { PlayerListSettings, ClanGroup } from './PlayerListTypes';
import { DEFAULT_SETTINGS } from './PlayerListTypes';
import {
  getPlayerClanTag,
  groupPlayersByClan,
  findWorkerId,
  fetchGameData,
  diffPlayerSets,
  stripClanTag,
  computeClanTeamMap,
  getTeamListForLobby,
  mapNameToFileKey,
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
  private previousClanGroups: ClanGroup[] = [];
  private previousUntaggedPlayers: string[] = [];
  private sleeping: boolean;
  private debugSequence: string[] = [];
  private showOnlyClans: boolean = true;
  private recentTags: string[] = [];
  private usernameCheckInterval: ReturnType<typeof setInterval> | null = null;
  private usernameAttachInterval: ReturnType<typeof setInterval> | null = null;
  private debugKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private lastFetchedGameId: string | null = null;
  private lastFetchTime: number = 0;
  private fetchDebounceMs: number = 1500;
  private lastRenderedShowOnlyClans?: boolean;
  private currentPlayerUsername: string = '';
  private selectedClanTag: string | null = null;
  private lastRenderedSelectedClanTag?: string | null;
  private playerListUpdateSubscribers: Array<
    (payload: { activeClanTag: string | null; hasClanmateMatch: boolean }) => void
  > = [];
  private lobbyConfig: GameConfig | null = null;
  private nationCount: number = 0;
  private lastMapKey: string | null = null;
  private currentGameId: string | null = null;
  private teamColorAllocator = new TeamColorAllocator();
  private clanColorAllocator = new ColorAllocator(HUMAN_COLORS, FALLBACK_COLORS);
  private clanColorMap: Map<string, RGB> = new Map();
  private clanTeamMap: Map<string, string> = new Map();

  // DOM elements
  private container!: HTMLDivElement;
  private header!: HTMLDivElement;
  private debugInfo!: HTMLDivElement;
  private quickTagSwitch!: HTMLDivElement;
  private checkboxFilter!: HTMLDivElement;
  private content!: HTMLDivElement;
  private resizeHandler!: ResizeHandler;
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
      this.currentGameId = null;
      this.lobbyConfig = null;
      this.nationCount = 0;
      this.lastMapKey = null;
      this.resetColorAllocators();
      this.updateListWithNames([]);
      return;
    }

    const firstLobby = lobbies[0];
    if (!firstLobby) return;

    const gameId = firstLobby.gameID;
    if (this.currentGameId !== gameId) {
      this.currentGameId = gameId;
      this.resetColorAllocators();
      this.nationCount = 0;
      this.lastMapKey = null;
    }

    this.lobbyConfig = firstLobby.gameConfig ?? null;
    if (this.lobbyConfig) {
      void this.updateNationCount(this.lobbyConfig);
    }
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
   * Subscribe to player list updates for clanmate matching
   */
  onPlayerListUpdate(
    callback: (payload: { activeClanTag: string | null; hasClanmateMatch: boolean }) => void
  ): void {
    this.playerListUpdateSubscribers.push(callback);
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
    const activeClanTag = this.getActiveClanTag();
    const sameSelected = this.lastRenderedSelectedClanTag === activeClanTag;

    if (samePlayers && sameFilter && sameSelected) {
      return; // No changes
    }

    const { clanGroups, untaggedPlayers } = groupPlayersByClan(names);

    // Store current state as previous before updating
    this.previousClanGroups = this.clanGroups;
    this.previousUntaggedPlayers = this.untaggedPlayers;

    this.clanGroups = clanGroups;
    this.untaggedPlayers = untaggedPlayers;

    this.updateClanColorMaps();
    this.renderPlayerList();

    if (this.settings.showPlayerCount) {
      const countEl = this.header.querySelector('.of-player-list-count');
      if (countEl) {
        countEl.textContent = String(names.length);
      }
    }

    this.previousPlayers = nextPlayers;
    this.lastRenderedShowOnlyClans = this.showOnlyClans;
    this.notifyPlayerListUpdate();
  }

  private notifyPlayerListUpdate(): void {
    if (this.playerListUpdateSubscribers.length === 0) {
      return;
    }
    const activeClanTag = this.getActiveClanTag();
    const hasClanmateMatch = this.hasClanmateMatch(activeClanTag);
    const payload = { activeClanTag, hasClanmateMatch };
    this.playerListUpdateSubscribers.forEach((cb) => cb(payload));
  }

  private hasClanmateMatch(activeClanTag: string | null): boolean {
    if (!activeClanTag) {
      return false;
    }
    const normalizedTag = activeClanTag.toLowerCase();
    const currentName = this.currentPlayerUsername.trim();

    for (const group of this.clanGroups) {
      if (group.tag.toLowerCase() === normalizedTag) {
        if (!currentName) {
          return group.players.length > 0;
        }
        return group.players.some((player) => player.trim() !== currentName);
      }
    }

    return false;
  }

  /**
   * Initialize UI elements and attach to DOM
   */
  private initUI(): void {
    this.container = document.createElement('div');
    this.container.className = 'of-panel of-player-list-container';

    // Append to layout wrapper (will be created by main.ts)
    const wrapper = document.getElementById('of-game-layout-wrapper');
    if (wrapper) {
      wrapper.appendChild(this.container);
    } else {
      console.warn('[PlayerList] Layout wrapper not found, appending to body');
      document.body.appendChild(this.container);
    }

    const autoJoinSlot = document.createElement('div');
    autoJoinSlot.id = 'of-autojoin-slot';
    autoJoinSlot.className = 'of-autojoin-slot';
    this.container.appendChild(autoJoinSlot);

    this.header = document.createElement('div');
    this.header.className = 'of-header of-player-list-header';
    this.header.innerHTML = `
      <div class="of-header-title">
        <span class="of-player-list-title">Lobby Intel</span>
        <span class="of-badge of-player-list-count">0</span>
      </div>
    `;
    this.container.appendChild(this.header);

    this.debugInfo = document.createElement('div');
    this.debugInfo.className = 'of-player-debug-info';
    this.header.appendChild(this.debugInfo);

    this.quickTagSwitch = document.createElement('div');
    this.quickTagSwitch.className = 'of-quick-tag-switch';
    const quickTagLabel = document.createElement('span');
    quickTagLabel.className = 'of-quick-tag-label';
    quickTagLabel.textContent = 'Quick tags';
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

    this.resizeHandler = new ResizeHandler(
      this.container,
      (width) => {
        // Update CSS variable for body layout
        document.documentElement.style.setProperty('--player-list-width', width + 'px');
      },
      STORAGE_KEYS.playerListPanelSize,
      200,  // min width
      50    // max width (vw)
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

    let lastUsername = '';

    const commitRecentTag = () => {
      const inputs = findInputs();
      if (!inputs) return;

      const currentClanTag = (inputs.clanInput as HTMLInputElement)?.value || '';
      const currentUsername = (inputs.nameInput as HTMLInputElement)?.value || '';
      const fullUsername = currentClanTag
        ? `[${currentClanTag}] ${currentUsername}`
        : currentUsername;
      const tag = currentClanTag || getPlayerClanTag(fullUsername);

      if (tag && tag.length >= 2) {
        this.addRecentTag(tag);
      }
    };

    const checkUsername = () => {
      const inputs = findInputs();
      if (!inputs) return;

      const currentClanTag = (inputs.clanInput as HTMLInputElement)?.value || '';
      const currentUsername = (inputs.nameInput as HTMLInputElement)?.value || '';

      // Track full username changes (for backwards compatibility)
      const fullUsername = currentClanTag
        ? `[${currentClanTag}] ${currentUsername}`
        : currentUsername;

      if (fullUsername !== lastUsername) {
        lastUsername = fullUsername;
        this.currentPlayerUsername = fullUsername; // Track current player
        const tag = getPlayerClanTag(fullUsername);
        const didUpdateSelected = this.setSelectedClanTag(currentClanTag || tag);
        // Re-render to apply highlighting even if not in lobby
        if (!didUpdateSelected && this.clanGroups.length > 0) {
          this.renderPlayerList();
        }
      }
    };

    // Initialize current username immediately
    checkUsername();

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
        clanInput.addEventListener('change', () => {
          checkUsername();
          commitRecentTag();
        });
      }
      if (nameInput && !(nameInput.dataset as any).ofMonitored) {
        (nameInput.dataset as any).ofMonitored = 'true';
        nameInput.addEventListener('input', checkUsername);
        nameInput.addEventListener('change', () => {
          checkUsername();
          commitRecentTag();
        });
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

  private getAutoRejoinOnClanChange(): boolean {
    const saved = GM_getValue<{ autoRejoinOnClanChange?: boolean } | null>(
      STORAGE_KEYS.autoJoinSettings,
      null
    );
    if (saved && typeof saved.autoRejoinOnClanChange === 'boolean') {
      return saved.autoRejoinOnClanChange;
    }

    const legacy = GM_getValue<boolean | undefined>(STORAGE_KEYS.playerListAutoRejoin);
    return legacy ?? false;
  }

  /**
   * Apply clan tag to the username input field
   * v0.29.0: Use the separate clan tag input (maxlength="5")
   */
  private applyClanTagToNickname(tag: string): void {
    this.setSelectedClanTag(tag);

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

        // Auto-rejoin if enabled
        if (this.getAutoRejoinOnClanChange()) {
          this.performLobbyRejoin();
        }
      }
    }
  }

  /**
   * Add a clan tag to recent tags list
   * Keeps only the last 3 unique tags
   * If tag already exists, keeps it in its current position
   */
  private addRecentTag(tag: string): void {
    const upper = tag.toUpperCase();
    // Only add if not already in the list
    if (!this.recentTags.includes(upper)) {
      this.recentTags.unshift(upper);
      if (this.recentTags.length > 3) {
        this.recentTags = this.recentTags.slice(0, 3);
      }
      GM_setValue(STORAGE_KEYS.playerListRecentTags, this.recentTags);
      this.renderQuickTagSwitch();
    }
  }

  /**
   * Render the quick tag switch buttons
   */
  private renderQuickTagSwitch(): void {
    // Remove old items
    const oldItems = this.quickTagSwitch.querySelectorAll('.of-quick-tag-item');
    oldItems.forEach((item) => item.remove());

    // Add buttons for recent tags
    for (const tag of this.recentTags) {
      const item = document.createElement('div');
      item.className = 'of-quick-tag-item';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'of-quick-tag-btn';
      btn.textContent = tag;
      btn.title = `Apply [${tag}] to your username`;
      btn.addEventListener('click', () => {
        this.applyClanTagToNickname(tag);
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'of-quick-tag-remove';
      removeBtn.textContent = 'x';
      removeBtn.title = 'Remove from recent tags';
      removeBtn.setAttribute('aria-label', `Remove ${tag} from recent tags`);
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.recentTags = this.recentTags.filter((t) => t !== tag);
        GM_setValue(STORAGE_KEYS.playerListRecentTags, this.recentTags);
        this.renderQuickTagSwitch();
      });

      item.appendChild(btn);
      item.appendChild(removeBtn);
      this.quickTagSwitch.appendChild(item);
    }
  }

  /**
   * Create a clan group element with header and players
   */
  private createClanGroupEl(tag: string, players: string[], stats: any, isNew: boolean = false): HTMLElement {
    const groupEl = document.createElement('div');
    groupEl.className = 'of-clan-group';
    groupEl.setAttribute('data-clan-tag', tag.toLowerCase());

    const color = this.clanColorMap.get(tag.toLowerCase());
    if (color) {
      groupEl.style.setProperty('--clan-color', rgbToCss(color));
      groupEl.style.setProperty('--clan-color-soft', rgbaToCss(color, 0.14));
      groupEl.style.setProperty('--clan-color-strong', rgbaToCss(color, 0.28));
      groupEl.style.setProperty('--clan-color-border', rgbaToCss(color, 0.6));
    }

    if (isNew) {
      groupEl.classList.add('of-clan-group-enter');
    }

    const headerEl = document.createElement('div');
    headerEl.className = 'of-clan-group-header';

    let statsHtml = '';
    if (stats) {
      const ratio =
        stats.wins && stats.losses
          ? (stats.wins / stats.losses).toFixed(2)
          : stats.weightedWLRatio?.toFixed(2) || '0.00';
      const wins = stats.wins?.toLocaleString() || 0;
      const losses = stats.losses?.toLocaleString() || 0;
      statsHtml = `
        <span>W ${wins}</span>
        <span>•</span>
        <span>L ${losses}</span>
        <span>•</span>
        <span>R ${ratio}</span>
      `;
    }

    const activeClanTag = this.getActiveClanTag();
    const isCurrentClan = !!activeClanTag && tag.toLowerCase() === activeClanTag;

    headerEl.innerHTML = `
      <span class="of-clan-tag">[${tag}]</span>
      ${isCurrentClan ? `<span class="of-clan-you-badge">You</span>` : ''}
      <span class="of-clan-count">${players.length}</span>
      <div class="of-clan-actions">
        ${statsHtml ? `<div class="of-clan-stats">${statsHtml}</div>` : ''}
        <button class="of-clan-use-btn" title="Apply [${tag}] to your username">Use tag</button>
      </div>
    `;

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
      playersEl.appendChild(this.createPlayerEl(player, false, true));
    }

    groupEl.appendChild(headerEl);
    groupEl.appendChild(playersEl);

    return groupEl;
  }

  /**
   * Create a player element
   */
  private createPlayerEl(name: string, isNew: boolean = false, isInClanGroup: boolean = false): HTMLElement {
    const el = document.createElement('div');
    el.className = 'of-player-item';
    el.setAttribute('data-player-name', name);

    if (isNew) {
      el.classList.add('of-player-enter');
    }

    const nameEl = document.createElement('span');
    nameEl.className = 'of-player-name';
    // Strip clan tag when displaying inside a clan group
    nameEl.textContent = isInClanGroup ? stripClanTag(name) : name;

    el.appendChild(nameEl);
    return el;
  }

  /**
   * Normalize clan tags for consistent comparison
   */
  private normalizeClanTag(tag: string | null | undefined): string | null {
    if (!tag) {
      return null;
    }
    const trimmed = tag.trim();
    return trimmed ? trimmed.toLowerCase() : null;
  }

  /**
   * Update selected clan tag and refresh list when it changes
   */
  private setSelectedClanTag(tag: string | null | undefined): boolean {
    const normalized = this.normalizeClanTag(tag);
    if (normalized === this.selectedClanTag) {
      return false;
    }
    this.selectedClanTag = normalized;
    this.renderPlayerList();
    this.notifyPlayerListUpdate();
    return true;
  }

  /**
   * Find the clan tag used for highlighting and ordering
   */
  private getActiveClanTag(): string | null {
    if (this.selectedClanTag) {
      return this.selectedClanTag;
    }
    if (!this.currentPlayerUsername) {
      return null;
    }
    return this.normalizeClanTag(getPlayerClanTag(this.currentPlayerUsername));
  }

  /**
   * Sort clan groups with the current player's clan at the top
   */
  private sortClanGroupsWithPlayerFirst(
    groups: ClanGroup[],
    activeClanTag?: string | null
  ): ClanGroup[] {
    const playerClanTag = activeClanTag ?? this.getActiveClanTag();
    if (!playerClanTag) {
      return groups;
    }

    const playerClanIndex = groups.findIndex(
      (g) => g.tag.toLowerCase() === playerClanTag
    );

    if (playerClanIndex > 0) {
      const playerClan = groups[playerClanIndex]!;
      return [
        playerClan,
        ...groups.slice(0, playerClanIndex),
        ...groups.slice(playerClanIndex + 1),
      ];
    }

    return groups;
  }

  /**
   * Perform lobby rejoin to update username on server
   * Leaves lobby if currently in it, then rejoins
   */
  private async performLobbyRejoin(): Promise<void> {
    const publicLobby = document.querySelector('public-lobby') as any;
    const btn = LobbyUtils.getLobbyButton();

    if (!btn || !publicLobby) {
      console.warn('[PlayerList] Cannot rejoin - lobby elements not found');
      return;
    }

    const isInLobby = publicLobby.isLobbyHighlighted === true;

    if (isInLobby) {
      // Leave lobby first
      btn.click();

      // Wait for leave to complete (longer than debounce delay)
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Verify we left
      if (!LobbyUtils.verifyState('out')) {
        console.warn('[PlayerList] Failed to leave lobby');
        return;
      }
    }

    // Wait for username to propagate
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Join lobby
    const joined = LobbyUtils.tryJoinLobby();
    if (!joined) {
      console.warn('[PlayerList] Failed to join lobby');
    }
  }

  /**
   * Render the complete player list with animations
   * Uses differential updates to animate only changes
   */
  private renderPlayerList(): void {
    // Calculate differences for animation
    const diff = diffPlayerSets(
      this.previousPlayers,
      this.currentPlayers,
      this.previousClanGroups,
      this.clanGroups,
      this.previousUntaggedPlayers,
      this.untaggedPlayers
    );

    // If this is the first render or filter changed, do full rebuild
    const isFirstRender = this.previousPlayers.size === 0;
    const filterChanged = this.lastRenderedShowOnlyClans !== this.showOnlyClans;
    const activeClanTag = this.getActiveClanTag();
    const selectedChanged = this.lastRenderedSelectedClanTag !== activeClanTag;

    if (isFirstRender || filterChanged || selectedChanged) {
      this.renderPlayerListFull(activeClanTag);
    } else {
      // Otherwise, use differential updates with animations
      this.renderPlayerListDifferential(diff, activeClanTag);
    }

    this.lastRenderedSelectedClanTag = activeClanTag;
  }

  /**
   * Full rebuild of player list (no animations)
   * Used on first render or filter change
   */
  private renderPlayerListFull(activeClanTag?: string | null): void {
    this.content.innerHTML = '';

    // Sort clans with current player's clan at the top
    const resolvedClanTag = activeClanTag ?? this.getActiveClanTag();
    const sortedClanGroups = this.sortClanGroupsWithPlayerFirst(
      this.clanGroups,
      resolvedClanTag
    );

    // Render clan groups
    for (const group of sortedClanGroups) {
      const stats = ClanLeaderboardCache.getStats(group.tag);
      const groupEl = this.createClanGroupEl(group.tag, group.players, stats, false);

      // Apply current-player clan cue
      if (resolvedClanTag && group.tag.toLowerCase() === resolvedClanTag) {
        groupEl.classList.add('current-player-clan');
      }

      this.content.appendChild(groupEl);
    }

    // Render untagged players if filter is off
    if (!this.showOnlyClans) {
      for (const player of this.untaggedPlayers) {
        this.content.appendChild(this.createPlayerEl(player, false, false));
      }
    }
  }

  /**
   * Differential update of player list with animations
   * Only updates changed elements
   */
  private renderPlayerListDifferential(
    diff: import('./PlayerListTypes').PlayerDiff,
    activeClanTag?: string | null
  ): void {
    // Remove clans that no longer exist
    for (const clanTag of diff.removedClans) {
      const groupEl = this.content.querySelector(
        `[data-clan-tag="${clanTag.toLowerCase()}"]`
      ) as HTMLElement;
      if (groupEl) {
        this.removeClanGroupWithAnimation(groupEl);
      }
    }

    // Remove players from existing clans
    for (const [clanTag, players] of diff.removedByClan) {
      const groupEl = this.content.querySelector(
        `[data-clan-tag="${clanTag.toLowerCase()}"]`
      ) as HTMLElement;
      if (groupEl) {
        for (const playerName of players) {
          const playerEl = groupEl.querySelector(
            `[data-player-name="${CSS.escape(playerName)}"]`
          ) as HTMLElement;
          if (playerEl) {
            this.removePlayerWithAnimation(playerEl);
          }
        }
      }
    }

    // Remove untagged players
    if (!this.showOnlyClans) {
      for (const playerName of diff.removedUntagged) {
        const playerEl = this.content.querySelector(
          `.of-player-item[data-player-name="${CSS.escape(playerName)}"]`
        ) as HTMLElement;
        if (playerEl && !playerEl.closest('.of-clan-group')) {
          this.removePlayerWithAnimation(playerEl);
        }
      }
    }

    // Add new clans
    const resolvedClanTag = activeClanTag ?? this.getActiveClanTag();
    const sortedClanGroups = this.sortClanGroupsWithPlayerFirst(
      this.clanGroups,
      resolvedClanTag
    );

    for (const clanTag of diff.newClans) {
      const group = sortedClanGroups.find((g) => g.tag === clanTag);
      if (!group) continue;

      const stats = ClanLeaderboardCache.getStats(group.tag);
      const groupEl = this.createClanGroupEl(group.tag, group.players, stats, true);

      // Apply current-player clan cue
      if (resolvedClanTag && group.tag.toLowerCase() === resolvedClanTag) {
        groupEl.classList.add('current-player-clan');
      }

      // Insert in correct position
      this.insertClanGroupInOrder(groupEl, sortedClanGroups);

      // Clean up animation class after animation completes
      groupEl.addEventListener('animationend', () => {
        groupEl.classList.remove('of-clan-group-enter');
      }, { once: true });
    }

    // Add players to existing clans with stagger
    let staggerIndex = 0;
    for (const [clanTag, players] of diff.addedByClan) {
      const groupEl = this.content.querySelector(
        `[data-clan-tag="${clanTag.toLowerCase()}"]`
      ) as HTMLElement;
      if (!groupEl) continue;

      const playersContainer = groupEl.querySelector('.of-clan-group-players') as HTMLElement;
      if (!playersContainer) continue;

      // Check if group is collapsed
      const isCollapsed = groupEl.classList.contains('collapsed');

      for (const playerName of players) {
        const playerEl = this.createPlayerEl(playerName, true, true);

        // Add stagger class (limit to 5)
        if (staggerIndex > 0 && staggerIndex <= 4) {
          playerEl.classList.add(`of-player-enter-stagger-${staggerIndex}`);
        }
        staggerIndex++;

        // Don't animate if collapsed
        if (isCollapsed) {
          playerEl.classList.remove('of-player-enter');
        }

        playersContainer.appendChild(playerEl);

        // Clean up animation class after animation completes
        if (!isCollapsed) {
          playerEl.addEventListener('animationend', () => {
            playerEl.classList.remove('of-player-enter');
            for (let i = 1; i <= 4; i++) {
              playerEl.classList.remove(`of-player-enter-stagger-${i}`);
            }
          }, { once: true });
        }
      }

      // Update clan count
      this.updateClanCount(groupEl);
    }

    // Add untagged players with stagger
    if (!this.showOnlyClans) {
      for (const playerName of diff.addedUntagged) {
        const playerEl = this.createPlayerEl(playerName, true, false);

        // Add stagger class (limit to 5)
        if (staggerIndex > 0 && staggerIndex <= 4) {
          playerEl.classList.add(`of-player-enter-stagger-${staggerIndex}`);
        }
        staggerIndex++;

        this.content.appendChild(playerEl);

        // Clean up animation class
        playerEl.addEventListener('animationend', () => {
          playerEl.classList.remove('of-player-enter');
          for (let i = 1; i <= 4; i++) {
            playerEl.classList.remove(`of-player-enter-stagger-${i}`);
          }
        }, { once: true });
      }
    }

    // Update clan counts for all modified clans
    for (const group of sortedClanGroups) {
      const groupEl = this.content.querySelector(
        `[data-clan-tag="${group.tag.toLowerCase()}"]`
      ) as HTMLElement;
      if (groupEl) {
        const color = this.clanColorMap.get(group.tag.toLowerCase());
        if (color) {
          groupEl.style.setProperty('--clan-color', rgbToCss(color));
          groupEl.style.setProperty('--clan-color-soft', rgbaToCss(color, 0.14));
          groupEl.style.setProperty('--clan-color-strong', rgbaToCss(color, 0.28));
          groupEl.style.setProperty('--clan-color-border', rgbaToCss(color, 0.6));
        }
        this.updateClanCount(groupEl);
      }
    }
  }

  private resetColorAllocators(): void {
    this.teamColorAllocator.reset();
    this.clanColorAllocator.reset();
    this.clanColorMap.clear();
    this.clanTeamMap.clear();
  }

  private updateClanColorMaps(): void {
    this.clanColorMap.clear();
    this.clanTeamMap.clear();

    if (this.clanGroups.length === 0) {
      return;
    }

    const gameConfig = this.lobbyConfig;
    const isTeamMode = gameConfig?.gameMode === 'Team';

    if (isTeamMode && gameConfig) {
      const teams = getTeamListForLobby(gameConfig, this.currentPlayers.length, this.nationCount);
      const teamColorMap = this.teamColorAllocator.getTeamColorMap(teams);
      const clanTeamMap = computeClanTeamMap(this.currentPlayers, gameConfig, this.nationCount);

      for (const group of this.clanGroups) {
        const key = group.tag.toLowerCase();
        const team = clanTeamMap.get(key);
        const color = team ? teamColorMap.get(team) : undefined;
        if (color) {
          this.clanColorMap.set(key, color);
          this.clanTeamMap.set(key, team!);
        } else {
          this.clanColorMap.set(key, this.clanColorAllocator.assignColor(key));
        }
      }
      return;
    }

    const sorted = [...this.clanGroups]
      .map((group) => group.tag.toLowerCase())
      .sort((a, b) => a.localeCompare(b));
    for (const tag of sorted) {
      this.clanColorMap.set(tag, this.clanColorAllocator.assignColor(tag));
    }
  }

  private async updateNationCount(gameConfig: GameConfig): Promise<void> {
    if (gameConfig.disableNations) {
      this.nationCount = 0;
      return;
    }

    const mapKey = mapNameToFileKey(gameConfig.gameMap);
    if (!mapKey) {
      this.nationCount = 0;
      return;
    }

    if (this.lastMapKey === mapKey) {
      return;
    }

    this.lastMapKey = mapKey;

    try {
      const response = await fetch(`/maps/${mapKey}/manifest.json`);
      if (!response.ok) {
        throw new Error(`Failed to load manifest for ${mapKey}`);
      }
      const manifest = await response.json();
      const manifestNations = Array.isArray(manifest.nations) ? manifest.nations.length : 0;
      const isCompact = Boolean(gameConfig.publicGameModifiers?.isCompact) || gameConfig.gameMapSize === 'Compact';

      if (manifestNations === 0) {
        this.nationCount = 0;
      } else if (isCompact) {
        this.nationCount = Math.max(1, Math.floor(manifestNations * 0.25));
      } else {
        this.nationCount = manifestNations;
      }
    } catch (error) {
      console.warn('[PlayerList] Failed to fetch map manifest:', error);
      this.nationCount = 0;
    }

    this.updateClanColorMaps();
    this.renderPlayerList();
  }

  /**
   * Remove a player element with exit animation
   */
  private removePlayerWithAnimation(playerEl: HTMLElement): void {
    playerEl.classList.add('of-player-exit');
    playerEl.addEventListener('animationend', () => {
      playerEl.remove();
    }, { once: true });
  }

  /**
   * Remove a clan group with exit animation
   */
  private removeClanGroupWithAnimation(groupEl: HTMLElement): void {
    groupEl.classList.add('of-clan-group-exit');
    groupEl.addEventListener('animationend', () => {
      groupEl.remove();
    }, { once: true });
  }

  /**
   * Insert a clan group in the correct position based on sort order
   */
  private insertClanGroupInOrder(groupEl: HTMLElement, sortedGroups: ClanGroup[]): void {
    const clanTag = groupEl.getAttribute('data-clan-tag');
    if (!clanTag) {
      this.content.appendChild(groupEl);
      return;
    }

    // Find the index in sorted groups
    const groupIndex = sortedGroups.findIndex((g) => g.tag.toLowerCase() === clanTag);
    if (groupIndex === -1) {
      this.content.appendChild(groupEl);
      return;
    }

    // Find the next clan group in DOM that comes after this one in sorted order
    let insertBefore: Element | null = null;
    for (let i = groupIndex + 1; i < sortedGroups.length; i++) {
      const nextClanTag = sortedGroups[i]!.tag.toLowerCase();
      const nextGroupEl = this.content.querySelector(`[data-clan-tag="${nextClanTag}"]`);
      if (nextGroupEl) {
        insertBefore = nextGroupEl;
        break;
      }
    }

    if (insertBefore) {
      this.content.insertBefore(groupEl, insertBefore);
    } else {
      // Insert before untagged players if any
      const firstUntaggedPlayer = this.content.querySelector(
        '.of-player-item:not(.of-clan-group .of-player-item)'
      );
      if (firstUntaggedPlayer) {
        this.content.insertBefore(groupEl, firstUntaggedPlayer);
      } else {
        this.content.appendChild(groupEl);
      }
    }
  }

  /**
   * Update the player count badge in a clan group header
   */
  private updateClanCount(groupEl: HTMLElement): void {
    const countEl = groupEl.querySelector('.of-clan-count');
    const playersContainer = groupEl.querySelector('.of-clan-group-players');
    if (countEl && playersContainer) {
      const playerCount = playersContainer.querySelectorAll('.of-player-item').length;
      countEl.textContent = String(playerCount);
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
    if (saved && saved.width) {
      this.container.style.width = saved.width + 'px';
      document.documentElement.style.setProperty('--player-list-width', saved.width + 'px');
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
    if (this.resizeHandler) {
      this.resizeHandler.destroy();
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
