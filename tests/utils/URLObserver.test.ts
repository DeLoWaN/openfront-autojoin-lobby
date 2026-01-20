/**
 * Tests for URLObserver utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { URLObserver } from '@/utils/URLObserver';

describe('URLObserver', () => {
  beforeEach(() => {
    // Reset the observer state between tests
    URLObserver.callbacks = [];
    URLObserver.initialized = false;
    URLObserver.lastUrl = location.href;
  });

  it('should initialize only once', () => {
    expect(URLObserver.initialized).toBe(false);

    URLObserver.init();
    expect(URLObserver.initialized).toBe(true);

    // Second call should not reinitialize
    URLObserver.init();
    expect(URLObserver.initialized).toBe(true);
  });

  it('should add callbacks via subscribe', () => {
    const callback = vi.fn();

    expect(URLObserver.callbacks.length).toBe(0);

    URLObserver.subscribe(callback);

    expect(URLObserver.callbacks.length).toBe(1);
    expect(URLObserver.callbacks[0]).toBe(callback);
  });

  it('should initialize when subscribing', () => {
    expect(URLObserver.initialized).toBe(false);

    const callback = vi.fn();
    URLObserver.subscribe(callback);

    expect(URLObserver.initialized).toBe(true);
  });

  it('should notify all subscribers', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    URLObserver.subscribe(callback1);
    URLObserver.subscribe(callback2);

    URLObserver.notify();

    expect(callback1).toHaveBeenCalledWith(location.href);
    expect(callback2).toHaveBeenCalledWith(location.href);
  });
});
