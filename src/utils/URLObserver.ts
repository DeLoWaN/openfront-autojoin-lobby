/**
 * URLObserver - Detects URL changes in single-page applications
 *
 * Responsibilities:
 * - Monitor URL changes (including SPA navigation via pushState/replaceState)
 * - Notify subscribers when URL changes
 * - Handle popstate and hashchange events
 * - Fallback polling every 200ms to catch any missed changes
 */

type URLCallback = (url: string) => void;

interface URLObserverSingleton {
  callbacks: URLCallback[];
  lastUrl: string;
  initialized: boolean;
  init(): void;
  subscribe(callback: URLCallback): void;
  notify(): void;
}

export const URLObserver: URLObserverSingleton = {
  callbacks: [],
  lastUrl: location.href,
  initialized: false,

  /**
   * Initialize URL monitoring
   * Only runs once, subsequent calls are ignored
   */
  init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    const checkUrl = () => {
      if (location.href !== this.lastUrl) {
        this.lastUrl = location.href;
        this.notify();
      }
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', checkUrl);
    window.addEventListener('hashchange', checkUrl);

    // Intercept history.pushState and history.replaceState
    // (SPA frameworks use these for navigation without page reload)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args: Parameters<typeof history.pushState>) {
      originalPushState.apply(history, args);
      setTimeout(checkUrl, 0);
    };

    history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
      originalReplaceState.apply(history, args);
      setTimeout(checkUrl, 0);
    };

    // Fallback polling to catch any missed changes
    setInterval(checkUrl, 200);
  },

  /**
   * Subscribe to URL change notifications
   * Automatically initializes observer if not already initialized
   */
  subscribe(callback: URLCallback) {
    this.callbacks.push(callback);
    this.init();
  },

  /**
   * Notify all subscribers of URL change
   */
  notify() {
    this.callbacks.forEach((cb) => cb(location.href));
  },
};
