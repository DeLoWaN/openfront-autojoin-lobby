/**
 * DragHandler - Makes HTML elements draggable and persists their position
 *
 * Responsibilities:
 * - Make any HTMLElement draggable via mouse
 * - Save/restore position to GM_storage
 * - Avoid dragging when clicking interactive elements (inputs, buttons)
 * - Avoid dragging when clicking near resize handles
 */

import type { PanelPosition } from '@/types/game';

export class DragHandler {
  private el: HTMLElement;
  private onMove: (x: number, y: number) => void;
  private storageKey: string | null;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private elX: number = 0;
  private elY: number = 0;

  private handleMouseDown: (e: MouseEvent) => void;
  private handleMouseMove: (e: MouseEvent) => void;
  private handleMouseUp: () => void;

  constructor(
    el: HTMLElement,
    onMove: (x: number, y: number) => void,
    storageKey: string | null = null
  ) {
    this.el = el;
    this.onMove = onMove;
    this.storageKey = storageKey;

    // Bind methods to preserve 'this' context
    this.handleMouseDown = this._handleMouseDown.bind(this);
    this.handleMouseMove = this._handleMouseMove.bind(this);
    this.handleMouseUp = this._handleMouseUp.bind(this);

    // Attach initial event listener
    el.addEventListener('mousedown', this.handleMouseDown);

    // Load saved position if storage key provided
    if (storageKey) {
      this.loadPosition();
    }
  }

  /**
   * Load saved position from GM_storage and apply to element
   */
  private loadPosition(): void {
    if (!this.storageKey) return;

    const saved = GM_getValue<PanelPosition | null>(this.storageKey, null);
    if (saved) {
      this.el.style.left = saved.x + 'px';
      this.el.style.top = saved.y + 'px';
      this.el.style.right = 'auto';
    }
  }

  /**
   * Save current position to GM_storage
   */
  private savePosition(): void {
    if (!this.storageKey) return;

    GM_setValue(this.storageKey, {
      x: this.el.offsetLeft,
      y: this.el.offsetTop,
    });
  }

  /**
   * Handle mousedown event - start dragging if conditions are met
   */
  private _handleMouseDown(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    // Don't drag if clicking on interactive elements
    if (['INPUT', 'BUTTON', 'LABEL'].includes(target.tagName)) {
      return;
    }

    // Don't drag if clicking near the resize handle (bottom-right corner)
    const rect = this.el.getBoundingClientRect();
    const resizeHandleSize = 20; // Size of the resize handle area
    const isNearResizeHandle =
      e.clientX >= rect.right - resizeHandleSize &&
      e.clientY >= rect.bottom - resizeHandleSize;

    if (isNearResizeHandle) {
      return;
    }

    // Start dragging
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.elX = this.el.offsetLeft;
    this.elY = this.el.offsetTop;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * Handle mousemove event - update element position while dragging
   */
  private _handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const newX = this.elX + dx;
    const newY = this.elY + dy;

    this.onMove(newX, newY);
  }

  /**
   * Handle mouseup event - stop dragging and save position
   */
  private _handleMouseUp(): void {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.savePosition();
  }

  /**
   * Clean up event listeners
   * Call this when removing the draggable element from the DOM
   */
  destroy(): void {
    this.el.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}
