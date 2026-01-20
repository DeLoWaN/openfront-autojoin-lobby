/**
 * ResizeHandler - Makes HTML elements horizontally resizable via left-edge drag handle
 *
 * Responsibilities:
 * - Add a visible drag handle on the left edge of an element
 * - Allow horizontal resizing with min/max constraints
 * - Save/restore width to GM_storage
 * - Provide visual feedback during dragging
 */

export class ResizeHandler {
  private el: HTMLElement;
  private onResize: (width: number) => void;
  private storageKey: string | null;
  private minWidth: number;
  private maxWidthVw: number;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private handle: HTMLDivElement;

  private handleMouseDown: (e: MouseEvent) => void;
  private handleMouseMove: (e: MouseEvent) => void;
  private handleMouseUp: () => void;

  constructor(
    el: HTMLElement,
    onResize: (width: number) => void,
    storageKey: string | null = null,
    minWidth: number = 200,
    maxWidthVw: number = 50
  ) {
    this.el = el;
    this.onResize = onResize;
    this.storageKey = storageKey;
    this.minWidth = minWidth;
    this.maxWidthVw = maxWidthVw;

    // Bind methods to preserve 'this' context
    this.handleMouseDown = this._handleMouseDown.bind(this);
    this.handleMouseMove = this._handleMouseMove.bind(this);
    this.handleMouseUp = this._handleMouseUp.bind(this);

    // Create and attach resize handle
    this.handle = this.createHandle();
    el.appendChild(this.handle);

    // Load saved width if storage key provided
    if (storageKey) {
      this.loadWidth();
    }
  }

  /**
   * Create the visual drag handle element
   */
  private createHandle(): HTMLDivElement {
    const handle = document.createElement('div');
    handle.className = 'of-resize-handle';
    handle.addEventListener('mousedown', this.handleMouseDown);
    return handle;
  }

  /**
   * Load saved width from GM_storage and apply to element
   */
  private loadWidth(): void {
    if (!this.storageKey) return;

    const saved = GM_getValue<{ width?: number; height?: number } | null>(this.storageKey, null);
    if (saved && saved.width) {
      const clampedWidth = this.clampWidth(saved.width);
      this.el.style.width = clampedWidth + 'px';
      this.onResize(clampedWidth);
    }
  }

  /**
   * Save current width to GM_storage
   */
  private saveWidth(): void {
    if (!this.storageKey) return;

    GM_setValue(this.storageKey, {
      width: this.el.offsetWidth,
    });
  }

  /**
   * Clamp width between min and max constraints
   */
  private clampWidth(width: number): number {
    const maxWidth = window.innerWidth * (this.maxWidthVw / 100);
    return Math.max(this.minWidth, Math.min(width, maxWidth));
  }

  /**
   * Handle mousedown event - start resizing
   */
  private _handleMouseDown(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.isDragging = true;
    this.startX = e.clientX;
    this.startWidth = this.el.offsetWidth;

    this.handle.classList.add('dragging');

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * Handle mousemove event - update element width while resizing
   */
  private _handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    // Calculate new width (moving left = wider, moving right = narrower)
    const dx = this.startX - e.clientX;
    const newWidth = this.clampWidth(this.startWidth + dx);

    this.el.style.width = newWidth + 'px';
    this.onResize(newWidth);
  }

  /**
   * Handle mouseup event - stop resizing and save width
   */
  private _handleMouseUp(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.handle.classList.remove('dragging');

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    this.saveWidth();
  }

  /**
   * Clean up event listeners and remove handle
   * Call this when removing the resizable element from the DOM
   */
  destroy(): void {
    this.handle.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    if (this.handle.parentNode) {
      this.handle.parentNode.removeChild(this.handle);
    }
  }
}
