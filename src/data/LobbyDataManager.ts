/**
 * LobbyDataManager - Manages lobby data fetching via WebSocket with HTTP fallback
 *
 * Responsibilities:
 * - Connect to WebSocket for real-time lobby updates
 * - Fall back to HTTP polling if WebSocket fails
 * - Notify subscribers when lobby data changes
 * - Handle reconnection logic
 *
 * Strategy:
 * 1. Try WebSocket connection (3 attempts)
 * 2. If WebSocket fails, fall back to HTTP polling
 * 3. Notify all subscribers whenever data updates
 */

import { CONFIG } from '@/config/constants';
import type { Lobby, LobbiesUpdateMessage } from '@/types/game';

type LobbyCallback = (lobbies: Lobby[]) => void;

interface LobbyDataManagerSingleton {
  subscribers: LobbyCallback[];
  ws: WebSocket | null;
  fallbackInterval: ReturnType<typeof setInterval> | null;
  lastLobbies: Lobby[];
  pollingRate: number;
  wsConnectionAttempts: number;
  maxWsAttempts: number;
  reconnectTimeout: ReturnType<typeof setTimeout> | null;
  start(): void;
  stop(): void;
  subscribe(callback: LobbyCallback): void;
  connectWebSocket(): void;
  startFallbackPolling(): void;
  stopFallbackPolling(): void;
  fetchData(): Promise<void>;
  notifySubscribers(): void;
}

export const LobbyDataManager: LobbyDataManagerSingleton = {
  subscribers: [],
  ws: null,
  fallbackInterval: null,
  lastLobbies: [],
  pollingRate: CONFIG.lobbyPollingRate,
  wsConnectionAttempts: 0,
  maxWsAttempts: 3,
  reconnectTimeout: null,

  /**
   * Start the lobby data manager
   * Attempts WebSocket connection first
   */
  start() {
    if (this.ws || this.fallbackInterval) {
      return; // Already running
    }
    console.log('[Bundle] Starting LobbyDataManager with WebSocket');
    this.wsConnectionAttempts = 0;
    this.connectWebSocket();
  },

  /**
   * Stop the lobby data manager
   * Closes WebSocket and stops polling
   */
  stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopFallbackPolling();
  },

  /**
   * Subscribe to lobby data updates
   * Callback will be called whenever lobby data changes
   */
  subscribe(callback: LobbyCallback) {
    this.subscribers.push(callback);
  },

  /**
   * Attempt to connect via WebSocket
   * Falls back to HTTP polling after max attempts
   */
  connectWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/lobbies`;

      this.ws = new WebSocket(wsUrl);

      this.ws.addEventListener('open', () => {
        console.log('[Bundle] WebSocket connected');
        this.wsConnectionAttempts = 0;
        this.stopFallbackPolling();
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      });

      this.ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as LobbiesUpdateMessage;
          if (message.type === 'lobbies_update') {
            this.lastLobbies = message.data?.lobbies ?? [];
            this.notifySubscribers();
          }
        } catch (e) {
          console.error('[Bundle] WebSocket parse error:', e);
        }
      });

      this.ws.addEventListener('close', () => {
        console.log('[Bundle] WebSocket disconnected');
        this.ws = null;
        this.wsConnectionAttempts++;

        if (this.wsConnectionAttempts >= this.maxWsAttempts) {
          console.log('[Bundle] Max WebSocket attempts reached, falling back to HTTP');
          this.startFallbackPolling();
        } else {
          // Retry connection after 3 seconds
          this.reconnectTimeout = setTimeout(() => this.connectWebSocket(), 3000);
        }
      });

      this.ws.addEventListener('error', (e) => {
        console.error('[Bundle] WebSocket error:', e);
      });
    } catch (e) {
      console.error('[Bundle] WebSocket connection error:', e);
      this.wsConnectionAttempts++;
      if (this.wsConnectionAttempts >= this.maxWsAttempts) {
        this.startFallbackPolling();
      }
    }
  },

  /**
   * Start HTTP polling as fallback when WebSocket fails
   */
  startFallbackPolling() {
    if (this.fallbackInterval) return; // Already polling

    console.log('[Bundle] Starting HTTP fallback polling');
    this.fetchData(); // Fetch immediately
    this.fallbackInterval = setInterval(() => this.fetchData(), this.pollingRate);
  },

  /**
   * Stop HTTP polling
   */
  stopFallbackPolling() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  },

  /**
   * Fetch lobby data via HTTP API
   * Only fetches if on lobby page
   */
  async fetchData() {
    // Only fetch if we're on the lobby page
    if (
      location.pathname !== '/' &&
      !location.pathname.startsWith('/public-lobby')
    ) {
      return;
    }

    try {
      const response = await fetch('/api/public_lobbies');

      if (response.status === 429) {
        console.warn('[Bundle] Rate limited.');
        return;
      }

      const data = await response.json();
      this.lastLobbies = data.lobbies || [];
      this.notifySubscribers();
    } catch (e) {
      console.error('[Bundle] API Error:', e);
      this.lastLobbies = [];
      this.notifySubscribers();
    }
  },

  /**
   * Notify all subscribers of lobby data update
   */
  notifySubscribers() {
    this.subscribers.forEach((cb) => cb(this.lastLobbies));
  },
};
