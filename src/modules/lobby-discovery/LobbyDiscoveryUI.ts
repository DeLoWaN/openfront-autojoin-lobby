/**
 * LobbyDiscoveryUI - notify-only discovery interface for matching lobbies.
 */

import { STORAGE_KEYS } from '@/config/constants';
import { LobbyUtils } from '@/utils/LobbyUtils';
import { SoundUtils } from '@/utils/SoundUtils';
import { URLObserver } from '@/utils/URLObserver';
import type { Lobby } from '@/types/game';
import type {
  LobbyDiscoverySettings,
  DiscoveryCriteria,
  TeamCount,
  LegacyAutoJoinSettings,
} from './LobbyDiscoveryTypes';
import { LobbyDiscoveryEngine } from './LobbyDiscoveryEngine';
import {
  getGameDetailsText,
  migrateLegacySettings,
} from './LobbyDiscoveryHelpers';

export class LobbyDiscoveryUI {
  private discoveryEnabled: boolean = true;
  private criteriaList: DiscoveryCriteria[] = [];
  private searchStartTime: number | null = null;
  private gameFoundTime: number | null = null;
  private soundEnabled: boolean = true;
  private notifiedLobbies: Set<string> = new Set();
  private lastNotifiedGameID: string | null = null;
  private isTeamThreeTimesMinEnabled: boolean = false;
  private sleeping: boolean = false;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private gameInfoInterval: ReturnType<typeof setInterval> | null = null;
  private notificationTimeout: ReturnType<typeof setTimeout> | null = null;

  private panel!: HTMLDivElement;
  private engine: LobbyDiscoveryEngine;

  constructor() {
    this.engine = new LobbyDiscoveryEngine();
    this.loadSettings();
    this.createUI();
    this.updateSleepState();
    URLObserver.subscribe(() => this.updateSleepState());
  }

  receiveLobbyUpdate(lobbies: Lobby[]): void {
    this.processLobbies(lobbies);
  }

  private migrateSettings(): void {
    const legacySettings = GM_getValue<LegacyAutoJoinSettings | null>('autoJoinSettings', null);
    const currentSettings = GM_getValue<LobbyDiscoverySettings | null>(
      STORAGE_KEYS.lobbyDiscoverySettings,
      null
    );

    const migrated = migrateLegacySettings(legacySettings, currentSettings);
    GM_setValue(STORAGE_KEYS.lobbyDiscoverySettings, migrated);
  }

  private loadSettings(): void {
    this.migrateSettings();

    const saved = GM_getValue<LobbyDiscoverySettings | null>(
      STORAGE_KEYS.lobbyDiscoverySettings,
      null
    );

    if (!saved) {
      return;
    }

    this.criteriaList = saved.criteria || [];
    this.soundEnabled = saved.soundEnabled !== undefined ? saved.soundEnabled : true;
    this.discoveryEnabled = saved.discoveryEnabled !== undefined ? saved.discoveryEnabled : true;
    this.isTeamThreeTimesMinEnabled = saved.isTeamThreeTimesMinEnabled || false;
  }

  private saveSettings(): void {
    GM_setValue(STORAGE_KEYS.lobbyDiscoverySettings, {
      criteria: this.criteriaList,
      discoveryEnabled: this.discoveryEnabled,
      soundEnabled: this.soundEnabled,
      isTeamThreeTimesMinEnabled: this.isTeamThreeTimesMinEnabled,
    } satisfies LobbyDiscoverySettings);
  }

  private updateSearchTimer(): void {
    const timerElement = document.getElementById('discovery-search-timer');
    if (!timerElement) return;

    if (!this.discoveryEnabled || this.searchStartTime === null || this.criteriaList.length === 0) {
      timerElement.style.display = 'none';
      this.gameFoundTime = null;
      return;
    }

    if (this.gameFoundTime !== null) {
      const elapsed = Math.floor((this.gameFoundTime - this.searchStartTime) / 1000);
      timerElement.textContent = `Match found (${Math.floor(elapsed / 60)}m ${elapsed % 60}s)`;
      timerElement.style.display = 'inline';
      return;
    }

    const elapsed = Math.floor((Date.now() - this.searchStartTime) / 1000);
    timerElement.textContent = `Scanning ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
    timerElement.style.display = 'inline';
  }

  private updateCurrentGameInfo(): void {
    const gameInfoElement = document.getElementById('discovery-current-game-info');
    if (!gameInfoElement || !LobbyUtils.isOnLobbyPage()) {
      if (gameInfoElement) {
        gameInfoElement.style.display = 'none';
      }
      return;
    }

    gameInfoElement.style.display = 'block';

    const publicLobby = document.querySelector('public-lobby') as any;
    if (!publicLobby || !publicLobby.lobbies || publicLobby.lobbies.length === 0) {
      gameInfoElement.textContent = 'Current game: No game';
      gameInfoElement.classList.add('not-applicable');
      return;
    }

    const currentLobby = publicLobby.lobbies[0];
    if (!currentLobby || !currentLobby.gameConfig) {
      gameInfoElement.textContent = 'Current game: No game';
      gameInfoElement.classList.add('not-applicable');
      return;
    }

    gameInfoElement.textContent = `Current game: ${getGameDetailsText(currentLobby)}`;
    gameInfoElement.classList.remove('not-applicable');
  }

  private processLobbies(lobbies: Lobby[]): void {
    try {
      this.updateCurrentGameInfo();

      if (!this.discoveryEnabled || this.criteriaList.length === 0) {
        return;
      }

      if (!LobbyUtils.isOnLobbyPage()) {
        return;
      }

      if (this.gameFoundTime !== null && this.lastNotifiedGameID !== null) {
        const currentLobby = lobbies.length > 0 ? lobbies[0] : null;
        if (currentLobby?.gameID !== this.lastNotifiedGameID) {
          this.syncSearchTimer({ resetStart: true });
        }
      }

      for (const lobby of lobbies) {
        if (!this.engine.matchesCriteria(lobby, this.criteriaList)) {
          continue;
        }

        if (!this.notifiedLobbies.has(lobby.gameID)) {
          this.showGameFoundNotification(lobby);
          if (this.soundEnabled) {
            SoundUtils.playGameFoundSound();
          }
          this.notifiedLobbies.add(lobby.gameID);
          this.gameFoundTime = Date.now();
          this.lastNotifiedGameID = lobby.gameID;
        }

        return;
      }
    } catch (error) {
      console.error('[LobbyDiscovery] Error processing lobbies:', error);
    }
  }

  private showGameFoundNotification(lobby: Lobby): void {
    this.dismissNotification();

    const notification = this.createNewNotification(lobby);
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('notification-visible');
    });

    this.notificationTimeout = setTimeout(() => {
      this.dismissNotification(notification);
    }, 10000);
  }

  private createNewNotification(lobby: Lobby): HTMLElement {
    const notification = document.createElement('div');
    notification.className = 'game-found-notification';

    const gameDetails = getGameDetailsText(lobby);
    notification.innerHTML = `
      <div class="notification-title">Matching Lobby Found</div>
      <div class="notification-detail">${gameDetails}</div>
      <div class="notification-hint">Join manually in the game lobby UI</div>
    `;

    notification.addEventListener('click', () => {
      this.dismissNotification(notification);
    });

    return notification;
  }

  private dismissNotification(targetElement: HTMLElement | null = null): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }

    const notifications = targetElement
      ? [targetElement]
      : Array.from(document.querySelectorAll('.game-found-notification'));

    for (const notification of notifications) {
      notification.classList.remove('notification-visible');
      notification.classList.add('notification-dismissing');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startGameInfoUpdates(): void {
    this.stopGameInfoUpdates();
    this.updateCurrentGameInfo();
    this.gameInfoInterval = setInterval(() => this.updateCurrentGameInfo(), 1000);
  }

  private stopGameInfoUpdates(): void {
    if (this.gameInfoInterval) {
      clearInterval(this.gameInfoInterval);
      this.gameInfoInterval = null;
    }
  }

  private syncSearchTimer(options: { resetStart?: boolean } = {}): void {
    const { resetStart = false } = options;

    this.stopTimer();

    if (resetStart) {
      this.searchStartTime = null;
      this.gameFoundTime = null;
      this.lastNotifiedGameID = null;
      this.notifiedLobbies.clear();
    }

    if (this.discoveryEnabled && this.criteriaList.length > 0) {
      if (this.searchStartTime === null) {
        this.searchStartTime = Date.now();
      }
      this.timerInterval = setInterval(() => this.updateSearchTimer(), 100);
    } else {
      this.searchStartTime = null;
      this.gameFoundTime = null;
    }

    this.updateSearchTimer();
  }

  private setDiscoveryEnabled(enabled: boolean, options: { resetTimer?: boolean } = {}): void {
    const { resetTimer = false } = options;
    this.discoveryEnabled = enabled;
    this.saveSettings();
    this.updateUI();
    this.syncSearchTimer({ resetStart: resetTimer });
  }

  private setModesExpanded(expanded: boolean): void {
    const modes = document.getElementById('discovery-modes');
    if (modes) {
      modes.classList.toggle('is-expanded', expanded);
    }
  }

  private getNumberValue(id: string): number | null {
    const input = document.getElementById(id) as HTMLInputElement;
    if (!input) return null;
    const val = parseInt(input.value, 10);
    return Number.isNaN(val) ? null : val;
  }

  private getAllTeamCountValues(): TeamCount[] {
    const values: TeamCount[] = [];
    const ids = [
      'discovery-team-duos',
      'discovery-team-trios',
      'discovery-team-quads',
      'discovery-team-2',
      'discovery-team-3',
      'discovery-team-4',
      'discovery-team-5',
      'discovery-team-6',
      'discovery-team-7',
    ];

    for (const id of ids) {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      if (checkbox?.checked) {
        if (checkbox.value === 'Duos' || checkbox.value === 'Trios' || checkbox.value === 'Quads') {
          values.push(checkbox.value);
        } else {
          const numeric = parseInt(checkbox.value, 10);
          if (!Number.isNaN(numeric)) {
            values.push(numeric);
          }
        }
      }
    }

    return values;
  }

  private setAllTeamCounts(checked: boolean): void {
    const ids = [
      'discovery-team-duos',
      'discovery-team-trios',
      'discovery-team-quads',
      'discovery-team-2',
      'discovery-team-3',
      'discovery-team-4',
      'discovery-team-5',
      'discovery-team-6',
      'discovery-team-7',
    ];

    for (const id of ids) {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = checked;
      }
    }
  }

  private buildCriteriaFromUI(): DiscoveryCriteria[] {
    const criteria: DiscoveryCriteria[] = [];

    const teamCheckbox = document.getElementById('discovery-team') as HTMLInputElement;
    if (!teamCheckbox?.checked) {
      return criteria;
    }

    const teamCounts = this.getAllTeamCountValues();

    if (teamCounts.length === 0) {
      criteria.push({
        gameMode: 'Team',
        teamCount: null,
        minPlayers: this.getNumberValue('discovery-team-min'),
        maxPlayers: this.getNumberValue('discovery-team-max'),
      });
      return criteria;
    }

    for (const teamCount of teamCounts) {
      criteria.push({
        gameMode: 'Team',
        teamCount,
        minPlayers: this.getNumberValue('discovery-team-min'),
        maxPlayers: this.getNumberValue('discovery-team-max'),
      });
    }

    return criteria;
  }

  private updateUI(): void {
    const statusText = document.querySelector('.status-text') as HTMLElement;
    const statusIndicator = document.querySelector('.status-indicator') as HTMLElement;

    if (statusText && statusIndicator) {
      if (this.discoveryEnabled) {
        statusText.textContent = 'Discovery Active';
        statusIndicator.style.background = '#38d9a9';
        statusIndicator.classList.add('active');
        statusIndicator.classList.remove('inactive');
      } else {
        statusText.textContent = 'Discovery Paused';
        statusIndicator.style.background = '#888';
        statusIndicator.classList.remove('active');
        statusIndicator.classList.add('inactive');
      }
    }
  }

  private loadUIFromSettings(): void {
    const teamCheckbox = document.getElementById('discovery-team') as HTMLInputElement;
    const teamConfig = document.getElementById('discovery-team-config');
    const teamCriteria = this.criteriaList.filter((c) => c.gameMode === 'Team');
    const hasTeam = teamCriteria.length > 0;

    if (teamCheckbox) {
      teamCheckbox.checked = hasTeam;
      if (teamConfig) {
        teamConfig.style.display = hasTeam ? 'block' : 'none';
      }
    }

    const teamCounts = teamCriteria.map((c) => c.teamCount).filter((tc) => tc !== null);
    for (const teamCount of teamCounts) {
      let checkbox: HTMLInputElement | null = null;
      if (teamCount === 'Duos') checkbox = document.getElementById('discovery-team-duos') as HTMLInputElement;
      else if (teamCount === 'Trios') checkbox = document.getElementById('discovery-team-trios') as HTMLInputElement;
      else if (teamCount === 'Quads') checkbox = document.getElementById('discovery-team-quads') as HTMLInputElement;
      else if (typeof teamCount === 'number') checkbox = document.getElementById(`discovery-team-${teamCount}`) as HTMLInputElement;
      if (checkbox) checkbox.checked = true;
    }

    const teamCriteriaBase = teamCriteria[0];
    if (teamCriteriaBase) {
      const teamMinInput = document.getElementById('discovery-team-min') as HTMLInputElement;
      const teamMaxInput = document.getElementById('discovery-team-max') as HTMLInputElement;
      if (teamMinInput && teamCriteriaBase.minPlayers !== null) teamMinInput.value = String(teamCriteriaBase.minPlayers);
      if (teamMaxInput && teamCriteriaBase.maxPlayers !== null) teamMaxInput.value = String(teamCriteriaBase.maxPlayers);
    }

    const soundCheckbox = document.getElementById('discovery-sound-toggle') as HTMLInputElement;
    if (soundCheckbox) {
      soundCheckbox.checked = this.soundEnabled;
    }
  }

  private initializeSlider(
    minSliderId: string,
    maxSliderId: string,
    minInputId: string,
    maxInputId: string,
    fillId: string,
    minValueId: string,
    maxValueId: string
  ): void {
    const minSlider = document.getElementById(minSliderId) as HTMLInputElement;
    const maxSlider = document.getElementById(maxSliderId) as HTMLInputElement;
    const minInput = document.getElementById(minInputId) as HTMLInputElement;
    const maxInput = document.getElementById(maxInputId) as HTMLInputElement;

    if (!minSlider || !maxSlider || !minInput || !maxInput) return;

    const savedMin = parseInt(minInput.value, 10);
    const savedMax = parseInt(maxInput.value, 10);
    if (!Number.isNaN(savedMin)) {
      minSlider.value = String(savedMin);
    }
    if (!Number.isNaN(savedMax)) {
      maxSlider.value = String(savedMax);
    }

    const update = () => {
      this.updateSliderRange(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId);
      this.criteriaList = this.buildCriteriaFromUI();
      this.saveSettings();
      this.syncSearchTimer({ resetStart: true });
    };

    minSlider.addEventListener('input', update);
    maxSlider.addEventListener('input', update);

    this.updateSliderRange(minSliderId, maxSliderId, minInputId, maxInputId, fillId, minValueId, maxValueId);
  }

  private updateSliderRange(
    minSliderId: string,
    maxSliderId: string,
    minInputId: string,
    maxInputId: string,
    fillId: string,
    minValueId: string,
    maxValueId: string
  ): void {
    const minSlider = document.getElementById(minSliderId) as HTMLInputElement;
    const maxSlider = document.getElementById(maxSliderId) as HTMLInputElement;
    const minInput = document.getElementById(minInputId) as HTMLInputElement;
    const maxInput = document.getElementById(maxInputId) as HTMLInputElement;
    const fill = document.getElementById(fillId);
    const minValueSpan = document.getElementById(minValueId);
    const maxValueSpan = document.getElementById(maxValueId);

    if (!minSlider || !maxSlider || !minInput || !maxInput) return;

    let minVal = parseInt(minSlider.value, 10);
    let maxVal = parseInt(maxSlider.value, 10);

    if (this.isTeamThreeTimesMinEnabled) {
      maxVal = Math.min(parseInt(maxSlider.max, 10), Math.max(1, 3 * minVal));
      maxSlider.value = String(maxVal);
    }

    if (minVal > maxVal) {
      minVal = maxVal;
      minSlider.value = String(minVal);
    }

    minInput.value = String(minVal);
    maxInput.value = String(maxVal);

    if (minValueSpan) {
      minValueSpan.textContent = minVal === 1 ? 'Any' : String(minVal);
    }
    if (maxValueSpan) {
      maxValueSpan.textContent = maxVal === parseInt(maxSlider.max, 10) ? 'Any' : String(maxVal);
    }

    if (fill) {
      const minPercent = ((minVal - parseInt(minSlider.min, 10)) / (parseInt(minSlider.max, 10) - parseInt(minSlider.min, 10))) * 100;
      const maxPercent = ((maxVal - parseInt(minSlider.min, 10)) / (parseInt(minSlider.max, 10) - parseInt(minSlider.min, 10))) * 100;
      fill.style.left = minPercent + '%';
      fill.style.width = maxPercent - minPercent + '%';
    }
  }

  private setupEventListeners(): void {
    document.getElementById('discovery-status')?.addEventListener('click', () => {
      this.setDiscoveryEnabled(!this.discoveryEnabled, { resetTimer: true });
    });

    const modes = document.getElementById('discovery-modes');
    if (modes) {
      modes.addEventListener('mouseenter', () => this.setModesExpanded(true));
      modes.addEventListener('mouseleave', () => this.setModesExpanded(false));
    }

    const teamCheckbox = document.getElementById('discovery-team') as HTMLInputElement;
    if (teamCheckbox) {
      teamCheckbox.addEventListener('change', () => {
        const teamConfig = document.getElementById('discovery-team-config');
        if (teamConfig) {
          teamConfig.style.display = teamCheckbox.checked ? 'block' : 'none';
        }
        this.criteriaList = this.buildCriteriaFromUI();
        this.saveSettings();
        this.syncSearchTimer({ resetStart: true });
      });
    }

    const threeTimesCheckbox = document.getElementById('discovery-team-three-times') as HTMLInputElement;
    if (threeTimesCheckbox) {
      threeTimesCheckbox.checked = this.isTeamThreeTimesMinEnabled;
      threeTimesCheckbox.addEventListener('change', () => {
        this.isTeamThreeTimesMinEnabled = threeTimesCheckbox.checked;
        this.saveSettings();

        const minSlider = document.getElementById('discovery-team-min-slider') as HTMLInputElement;
        const maxSlider = document.getElementById('discovery-team-max-slider') as HTMLInputElement;
        if (minSlider && maxSlider) {
          const minVal = parseInt(minSlider.value, 10);
          maxSlider.value = this.isTeamThreeTimesMinEnabled
            ? String(Math.min(50, Math.max(1, 3 * minVal)))
            : maxSlider.value;
          this.updateSliderRange(
            'discovery-team-min-slider',
            'discovery-team-max-slider',
            'discovery-team-min',
            'discovery-team-max',
            'discovery-team-range-fill',
            'discovery-team-min-value',
            'discovery-team-max-value'
          );
        }
      });
    }

    document.getElementById('discovery-team-select-all')?.addEventListener('click', () => {
      this.setAllTeamCounts(true);
      this.criteriaList = this.buildCriteriaFromUI();
      this.saveSettings();
      this.syncSearchTimer({ resetStart: true });
    });

    document.getElementById('discovery-team-deselect-all')?.addEventListener('click', () => {
      this.setAllTeamCounts(false);
      this.criteriaList = this.buildCriteriaFromUI();
      this.saveSettings();
      this.syncSearchTimer({ resetStart: true });
    });

    const teamCountIds = [
      'discovery-team-2',
      'discovery-team-3',
      'discovery-team-4',
      'discovery-team-5',
      'discovery-team-6',
      'discovery-team-7',
      'discovery-team-duos',
      'discovery-team-trios',
      'discovery-team-quads',
    ];

    for (const id of teamCountIds) {
      document.getElementById(id)?.addEventListener('change', () => {
        this.criteriaList = this.buildCriteriaFromUI();
        this.saveSettings();
        this.syncSearchTimer({ resetStart: true });
      });
    }

    const soundToggle = document.getElementById('discovery-sound-toggle') as HTMLInputElement;
    if (soundToggle) {
      soundToggle.addEventListener('change', () => {
        this.soundEnabled = soundToggle.checked;
        this.saveSettings();
      });
    }
  }

  private createUI(): void {
    if (document.getElementById('openfront-discovery-panel')) {
      return;
    }

    this.panel = document.createElement('div');
    this.panel.id = 'openfront-discovery-panel';
    this.panel.className = 'of-panel discovery-panel';
    this.panel.innerHTML = `
      <div class="of-header discovery-header">
        <div class="discovery-title">
          <span class="discovery-title-text">Lobby Discovery</span>
          <span class="discovery-title-sub">NOTIFY ONLY</span>
        </div>
      </div>
      <div class="discovery-body">
        <div class="of-content discovery-content">
          <div class="discovery-status-bar">
            <div class="discovery-status" id="discovery-status">
              <span class="status-indicator"></span>
              <span class="status-text">Discovery Active</span>
              <span class="search-timer" id="discovery-search-timer" style="display: none;"></span>
            </div>
            <label class="discovery-toggle-label">
              <input type="checkbox" id="discovery-sound-toggle">
              <span>Sound</span>
            </label>
          </div>
          <div class="discovery-modes" id="discovery-modes">
            <div class="discovery-modes-rail" aria-hidden="true">
              <span class="discovery-modes-caret">▸</span>
              <span class="discovery-modes-label">Filters</span>
              <span class="discovery-modes-dot"></span>
              <span class="discovery-modes-dot"></span>
              <span class="discovery-modes-dot"></span>
            </div>
            <div class="discovery-modes-body">
              <div class="discovery-section">
                <div class="discovery-section-title">Modes</div>
                <div class="discovery-config-grid">
                  <div class="discovery-mode-config discovery-config-card">
                    <label class="mode-checkbox-label"><input type="checkbox" id="discovery-team" name="gameMode" value="Team"><span>Team</span></label>
                    <div class="discovery-mode-inner" id="discovery-team-config" style="display: none;">
                      <div class="team-count-section">
                        <label>Teams (optional):</label>
                        <div>
                          <button type="button" id="discovery-team-select-all" class="select-all-btn">Select All</button>
                          <button type="button" id="discovery-team-deselect-all" class="select-all-btn">Deselect All</button>
                        </div>
                        <div class="team-count-options-centered">
                          <div class="team-count-column">
                            <label><input type="checkbox" id="discovery-team-duos" value="Duos"> Duos</label>
                            <label><input type="checkbox" id="discovery-team-trios" value="Trios"> Trios</label>
                            <label><input type="checkbox" id="discovery-team-quads" value="Quads"> Quads</label>
                          </div>
                          <div class="team-count-column">
                            <label><input type="checkbox" id="discovery-team-2" value="2"> 2 teams</label>
                            <label><input type="checkbox" id="discovery-team-3" value="3"> 3 teams</label>
                            <label><input type="checkbox" id="discovery-team-4" value="4"> 4 teams</label>
                          </div>
                          <div class="team-count-column">
                            <label><input type="checkbox" id="discovery-team-5" value="5"> 5 teams</label>
                            <label><input type="checkbox" id="discovery-team-6" value="6"> 6 teams</label>
                            <label><input type="checkbox" id="discovery-team-7" value="7"> 7 teams</label>
                          </div>
                        </div>
                      </div>
                      <div class="player-filter-info"><small>Filter by players per team:</small></div>
                      <div class="capacity-range-wrapper">
                        <div class="capacity-range-visual">
                          <div class="capacity-track">
                            <div class="capacity-range-fill" id="discovery-team-range-fill"></div>
                            <input type="range" id="discovery-team-min-slider" min="1" max="50" value="1" class="capacity-slider capacity-slider-min">
                            <input type="range" id="discovery-team-max-slider" min="1" max="50" value="50" class="capacity-slider capacity-slider-max">
                          </div>
                          <div class="capacity-labels">
                            <div class="capacity-label-group"><label for="discovery-team-min-slider">Min:</label><span class="capacity-value" id="discovery-team-min-value">1</span></div>
                            <div class="three-times-checkbox"><label for="discovery-team-three-times">3×</label><input type="checkbox" id="discovery-team-three-times"></div>
                            <div class="capacity-label-group"><label for="discovery-team-max-slider">Max:</label><span class="capacity-value" id="discovery-team-max-value">50</span></div>
                          </div>
                        </div>
                        <div class="capacity-inputs-hidden">
                          <input type="number" id="discovery-team-min" min="1" max="50" style="display: none;">
                          <input type="number" id="discovery-team-max" min="1" max="50" style="display: none;">
                        </div>
                      </div>
                      <div class="current-game-info" id="discovery-current-game-info" style="display: none;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const mountPoint = document.getElementById('of-discovery-slot');
    if (mountPoint) {
      mountPoint.appendChild(this.panel);
    } else {
      console.warn('[LobbyDiscovery] Discovery slot not found, appending to body');
      document.body.appendChild(this.panel);
    }

    this.setupEventListeners();
    this.setModesExpanded(false);
    this.loadUIFromSettings();
    this.initializeSlider(
      'discovery-team-min-slider',
      'discovery-team-max-slider',
      'discovery-team-min',
      'discovery-team-max',
      'discovery-team-range-fill',
      'discovery-team-min-value',
      'discovery-team-max-value'
    );
    this.updateUI();
    this.syncSearchTimer();
    this.startGameInfoUpdates();
  }

  private updateSleepState(): void {
    const onLobby = LobbyUtils.isOnLobbyPage();
    this.sleeping = !onLobby;

    if (this.sleeping) {
      this.panel.classList.add('hidden');
      this.stopTimer();
      this.stopGameInfoUpdates();
    } else {
      this.panel.classList.remove('hidden');
      this.syncSearchTimer();
      this.startGameInfoUpdates();
    }
  }

  cleanup(): void {
    this.stopTimer();
    this.stopGameInfoUpdates();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    this.dismissNotification();
  }
}
