/**
 * CSS styles for the userscript UI
 * Uses CSS-in-JS with theme tokens for consistent styling
 */

import { COLORS, SPACING, RADIUS, SHADOWS, TIMING } from '@/config/theme';
import { Z_INDEX } from '@/config/constants';

/**
 * Generate all CSS styles as a string for GM_addStyle
 */
export function getStyles(): string {
  return `
    .of-panel {
      position: fixed;
      background: ${COLORS.bgPrimary};
      border: 1.5px solid ${COLORS.border};
      border-radius: ${RADIUS.xl};
      box-shadow: ${SHADOWS.lg};
      font-family: 'Segoe UI', 'Roboto', sans-serif;
      color: ${COLORS.textPrimary};
      user-select: none;
      z-index: ${Z_INDEX.panel};
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .of-panel.hidden { display: none; }
    .of-header {
      padding: ${SPACING.md} ${SPACING.lg};
      background: ${COLORS.bgSecondary};
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      flex-shrink: 0;
      font-size: 1.1em;
      border-bottom: 1px solid ${COLORS.border};
    }
    .of-content { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(128,150,180,0.15) transparent; }
    .of-content::-webkit-scrollbar { width: 7px; }
    .of-content::-webkit-scrollbar-thumb { background: rgba(110,130,180,0.12); border-radius: 5px; }
    .of-footer {
      padding: ${SPACING.sm} ${SPACING.lg};
      display: flex;
      justify-content: space-between;
      background: ${COLORS.bgSecondary};
      flex-shrink: 0;
      border-top: 1px solid ${COLORS.border};
    }
    .of-button {
      background: ${COLORS.bgHover};
      border: none;
      color: ${COLORS.textPrimary};
      padding: ${SPACING.sm} ${SPACING.md};
      border-radius: ${RADIUS.md};
      cursor: pointer;
      font-size: 1em;
      font-weight: 600;
      transition: background ${TIMING.fast};
      outline: none;
    }
    .of-button:hover { background: rgba(100,125,190,0.18); }
    .of-button.primary { background: ${COLORS.accent}; }
    .of-button.primary:hover { background: ${COLORS.accentHover}; }
    .of-input {
      padding: ${SPACING.sm};
      background: rgba(210,215,235,0.12);
      border: 1.4px solid ${COLORS.border};
      border-radius: ${RADIUS.md};
      color: ${COLORS.textPrimary};
      font-size: 1em;
      outline: none;
      transition: border ${TIMING.fast};
    }
    .of-input:focus { border-color: ${COLORS.accent}; }
    .of-badge {
      background: ${COLORS.accentMuted};
      border-radius: ${RADIUS.xl};
      padding: 2px 10px;
      font-size: 0.9em;
      color: ${COLORS.textSecondary};
    }
    .of-toggle {
      width: 34px; height: 18px; border-radius: 11px; background: #2d3c62; border: none;
      position: relative; transition: background ${TIMING.fast}; cursor: pointer;
    }
    .of-toggle.on { background: ${COLORS.successSolid}; }
    .of-toggle-ball {
      position: absolute; left: 2px; top: 2px; width: 14px; height: 14px;
      border-radius: 50%; background: #fff; transition: left ${TIMING.fast};
    }
    .of-toggle.on .of-toggle-ball { left: 18px; }

    .of-player-list-container {
      position: fixed;
      top: 170px;
      right: 3px;
      width: 420px;
      height: 650px;
      resize: both;
      overflow: hidden;
      min-width: 320px;
      min-height: 300px;
      max-width: 90vw;
      max-height: 90vh;
    }
    .of-player-list-count { font-size: 0.9em; }
    .of-player-debug-info { font-size: 0.83em; color: #96a4cc; padding: 2px 6px; display: none; }

    .of-quick-tag-switch {
      padding: ${SPACING.md} ${SPACING.lg};
      background: ${COLORS.bgSecondary};
      border-bottom: 1px solid ${COLORS.border};
      display: flex;
      align-items: center;
      gap: ${SPACING.sm};
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .of-quick-tag-label {
      font-size: 0.85em;
      color: ${COLORS.textSecondary};
      font-weight: 500;
    }
    .of-quick-tag-btn {
      padding: 4px 12px;
      font-size: 0.85em;
      background: ${COLORS.bgHover};
      color: ${COLORS.textPrimary};
      border: 1px solid ${COLORS.border};
      border-radius: ${RADIUS.md};
      cursor: pointer;
      transition: all ${TIMING.fast};
      font-weight: 500;
    }
    .of-quick-tag-btn:hover {
      background: ${COLORS.accentMuted};
      border-color: ${COLORS.accent};
    }

    .of-clan-checkbox-filter {
      padding: ${SPACING.md} ${SPACING.lg};
      background: ${COLORS.bgSecondary};
      border-bottom: 1px solid ${COLORS.border};
      display: flex;
      align-items: center;
      gap: ${SPACING.sm};
      flex-shrink: 0;
    }
    .of-clan-checkbox-filter input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin: 0;
    }
    .of-clan-checkbox-filter label {
      cursor: pointer;
      color: ${COLORS.textPrimary};
      font-size: 0.95em;
      user-select: none;
      flex: 1;
    }

    .of-auto-rejoin-checkbox {
      padding: ${SPACING.md} ${SPACING.lg};
      background: ${COLORS.bgSecondary};
      border-bottom: 1px solid ${COLORS.border};
      display: flex;
      align-items: center;
      gap: ${SPACING.sm};
      flex-shrink: 0;
    }
    .of-auto-rejoin-checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin: 0;
    }
    .of-auto-rejoin-checkbox label {
      cursor: pointer;
      color: ${COLORS.textPrimary};
      font-size: 0.95em;
      user-select: none;
      flex: 1;
    }

    .of-clan-group {
      border-bottom: 1px solid rgba(110, 130, 180, 0.08);
    }
    .of-clan-group-enter {
      animation: clanGroupEnter ${TIMING.slow} cubic-bezier(.27,.82,.48,1.06) forwards;
    }
    @keyframes clanGroupEnter {
      from { opacity: 0; transform: translateY(-15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .of-clan-group-exit {
      animation: clanGroupExit 0.25s cubic-bezier(.51,.01,1,1.01) forwards;
    }
    @keyframes clanGroupExit {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-18px); }
    }
    .of-clan-group-header {
      padding: ${SPACING.sm} ${SPACING.md};
      background: ${COLORS.bgHover};
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: ${SPACING.sm};
      transition: background ${TIMING.fast};
      flex-wrap: wrap;
    }
    .of-clan-group-header:hover {
      background: ${COLORS.bgHover};
    }
    .of-clan-group.current-player-clan .of-clan-group-header {
      background: rgba(59, 130, 246, 0.25) !important;
      border-left: 4px solid rgba(59, 130, 246, 1) !important;
      padding-left: calc(${SPACING.sm} - 4px);
    }
    .of-clan-group.current-player-clan .of-player-item {
      background: rgba(59, 130, 246, 0.15) !important;
      border-left: 4px solid rgba(59, 130, 246, 0.6) !important;
      padding-left: calc(${SPACING.md} + 20px - 4px) !important;
    }
    .of-clan-arrow {
      font-size: 0.8em;
      color: ${COLORS.textSecondary};
      transition: transform ${TIMING.fast};
      width: 16px;
      display: inline-block;
    }
    .of-clan-group.collapsed .of-clan-arrow {
      transform: rotate(-90deg);
    }
    .of-clan-tag {
      font-weight: 600;
      color: ${COLORS.textPrimary};
      font-size: 0.92em;
    }
    .of-clan-count {
      font-size: 0.8em;
      color: ${COLORS.textSecondary};
      background: ${COLORS.accentMuted};
      padding: 2px 7px;
      border-radius: ${RADIUS.xl};
    }
    .of-clan-actions {
      display: flex;
      gap: ${SPACING.sm};
      flex-wrap: wrap;
      align-items: center;
      margin-left: auto;
    }
    .of-clan-stats {
      display: flex;
      gap: ${SPACING.xs};
      font-size: 0.78em;
      color: ${COLORS.textSecondary};
      flex-wrap: wrap;
    }
    .of-clan-stats span {
      white-space: nowrap;
    }
    .of-clan-use-btn {
      padding: 4px 10px;
      font-size: 0.8em;
      background: ${COLORS.accentMuted};
      color: ${COLORS.textPrimary};
      border: 1px solid ${COLORS.borderAccent};
      border-radius: ${RADIUS.sm};
      cursor: pointer;
      transition: all ${TIMING.fast};
      font-weight: 500;
      white-space: nowrap;
    }
    .of-clan-use-btn:hover {
      background: ${COLORS.accent};
      border-color: ${COLORS.accent};
    }
    .of-clan-group-players {
      overflow: hidden;
      transition: max-height ${TIMING.normal} ease-in-out;
    }
    .of-clan-group.collapsed .of-clan-group-players {
      max-height: 0;
    }
    .of-clan-group-players .of-player-item {
      padding-left: calc(${SPACING.md} + 20px);
      background: transparent;
      cursor: default;
    }
    .of-player-list-content { flex: 1; }
    .of-player-item {
      padding: 5px ${SPACING.md}; border-bottom: 1px solid rgba(110,130,180,0.08);
      font-size: 0.88em; line-height: 1.4; position: relative;
      transition: background-color ${TIMING.slow}; cursor: default;
      display: flex; align-items: center; justify-content: space-between;
    }
    .of-player-name { color: ${COLORS.textPrimary}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 400; flex: 1; }
    .of-player-highlighted { background: linear-gradient(90deg, ${COLORS.highlight} 40%, rgba(255,210,80,0.10)); border-left: 3.5px solid #FFD900; }
    .of-player-enter { animation: playerEnter ${TIMING.slow} cubic-bezier(.27,.82,.48,1.06) forwards; }
    .of-player-enter-stagger-1 { animation-delay: 30ms; }
    .of-player-enter-stagger-2 { animation-delay: 60ms; }
    .of-player-enter-stagger-3 { animation-delay: 90ms; }
    .of-player-enter-stagger-4 { animation-delay: 120ms; }
    .of-player-enter-highlight { background-color: rgba(110,160,255,0.14) !important; }
    .of-player-exit-highlight { background-color: rgba(220, 70, 90, 0.18); }
    .of-player-exit { animation: playerExit 0.25s cubic-bezier(.51,.01,1,1.01) forwards; }
    @keyframes playerEnter { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes playerExit { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-13px); } }
    .of-player-list-footer { padding: ${SPACING.sm} ${SPACING.lg}; display: flex; justify-content: space-between; background: ${COLORS.bgSecondary}; font-size: 1em; flex-shrink: 0; border-top: 1px solid ${COLORS.border}; }
    .of-player-list-button { background: ${COLORS.bgHover}; border: none; color: ${COLORS.textPrimary}; padding: 6px 13px; border-radius: ${RADIUS.md}; cursor: pointer; font-size: 1em; font-weight: 600; transition: background ${TIMING.fast}; outline: none; }
    .of-player-list-button:hover { background: rgba(100,125,190,0.18); }

    .autojoin-panel {
      position: fixed; top: 20px; right: 20px; width: 360px; max-width: 90vw; max-height: 80vh;
      transition: opacity ${TIMING.slow}, transform ${TIMING.slow}; cursor: default;
    }
    .autojoin-panel:active { cursor: grabbing; }
    .autojoin-panel.hidden { display: none; }
    .autojoin-content { display: flex; flex-direction: column; gap: ${SPACING.md}; padding: ${SPACING.md} ${SPACING.lg}; }
    .autojoin-footer { align-items: center; }
    .autojoin-main-button { width: 100%; padding: ${SPACING.md}; border: none; border-radius: ${RADIUS.md}; font-size: 1.1em; font-weight: bold; cursor: pointer; transition: all ${TIMING.slow}; text-align: center; }
    .autojoin-main-button.active { background: ${COLORS.success}; color: white; }
    .autojoin-main-button.inactive { background: rgba(100, 100, 100, 0.7); color: ${COLORS.textSecondary}; }
    .autojoin-mode-config { margin-bottom: ${SPACING.sm}; padding: ${SPACING.sm}; background: ${COLORS.bgSecondary}; border-radius: ${RADIUS.md}; }
    .mode-checkbox-label { display: flex; align-items: center; gap: 6px; font-weight: bold; cursor: pointer; margin-bottom: 6px; font-size: 0.95em; color: ${COLORS.textPrimary}; }
    .mode-checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .player-filter-info { margin-bottom: 6px; padding: 3px 0; }
    .player-filter-info small { color: ${COLORS.textSecondary}; font-size: 0.9em; }
    .capacity-range-wrapper { margin-top: 6px; }
    .capacity-range-visual { position: relative; padding: 12px 0 6px 0; }
    .capacity-track { position: relative; height: 6px; background: ${COLORS.accentMuted}; border-radius: 3px; margin-bottom: ${SPACING.sm}; }
    .team-count-options-centered { display: flex; justify-content: space-between; gap: 15px; margin: ${SPACING.sm} 0; }
    .team-count-column { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 0; background: rgba(20, 20, 30, 0.2); padding: 6px; border-radius: ${RADIUS.sm}; }
    .team-count-column label { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.85em; color: ${COLORS.textPrimary}; white-space: nowrap; user-select: none; }
    .team-count-column input[type="checkbox"] { width: 16px; height: 16px; margin: 0; }
    .select-all-btn { background: ${COLORS.accentMuted}; color: ${COLORS.textPrimary}; border: 1px solid ${COLORS.borderAccent}; border-radius: ${RADIUS.sm}; padding: ${SPACING.xs} ${SPACING.sm}; font-size: 0.8em; cursor: pointer; flex: 1; text-align: center; margin: 0 2px; }
    .select-all-btn:hover { background: rgba(59, 30, 246, 0.35); }
    .team-count-section > div:first-of-type { display: flex; gap: 5px; margin-bottom: ${SPACING.sm}; }
    .team-count-section > label { font-size: 0.9em; color: ${COLORS.textPrimary}; font-weight: 500; margin-bottom: 5px; display: block; }
    .capacity-labels { display: flex; justify-content: space-between; align-items: center; margin-top: ${SPACING.sm}; }
    .three-times-checkbox { display: flex; align-items: center; gap: ${SPACING.xs}; font-size: 0.85em; color: ${COLORS.textPrimary}; margin: 0 5px; }
    .three-times-checkbox input[type="checkbox"] { width: 15px; height: 15px; }
    .capacity-range-fill { position: absolute; height: 100%; background: rgba(59, 130, 246, 0.5); border-radius: 3px; pointer-events: none; opacity: 0.7; transition: left 0.1s ease, width 0.1s ease; }
    .capacity-slider { position: absolute; width: 100%; height: 6px; top: 0; left: 0; background: transparent; outline: none; -webkit-appearance: none; pointer-events: none; margin: 0; }
    .capacity-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${COLORS.accent}; cursor: pointer; pointer-events: all; border: 2px solid ${COLORS.textPrimary}; box-shadow: ${SHADOWS.sm}; }
    .capacity-slider-min { z-index: 2; }
    .capacity-slider-max { z-index: 1; }
    .capacity-label-group { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .capacity-label-group label { font-size: 0.9em; color: ${COLORS.textPrimary}; font-weight: normal; margin: 0; }
    .capacity-value { font-size: 0.9em; color: #FFFFFF; font-weight: 600; min-width: 40px; text-align: center; }
    .capacity-inputs-hidden { display: none; }
    .autojoin-status { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; background: ${COLORS.success}; }
    .status-text { font-size: 0.9em; color: ${COLORS.textPrimary}; }
    .search-timer { font-size: 0.9em; color: rgba(147, 197, 253, 0.9); font-weight: 500; margin-left: 8px; }
    .autojoin-settings { display: flex; align-items: center; }
    .sound-toggle-label { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.9em; color: ${COLORS.textPrimary}; }
    .sound-toggle-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .current-game-info { margin: 6px 0; padding: 5px ${SPACING.sm}; background: ${COLORS.accentMuted}; border-radius: ${RADIUS.sm}; font-size: 0.9em; color: rgba(147, 197, 253, 0.9); text-align: center; border: 1px solid rgba(59, 130, 246, 0.25); }
    .current-game-info.not-applicable { background: rgba(100, 100, 100, 0.1); color: ${COLORS.textMuted}; border-color: rgba(100, 100, 100, 0.2); font-style: italic; }
    .game-found-notification {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: 3px solid #60a5fa;
      border-radius: ${RADIUS.lg}; padding: ${SPACING.xl} 30px; z-index: ${Z_INDEX.notification};
      color: white; font-family: sans-serif; font-size: 1.1em; font-weight: 600; text-align: center;
      cursor: pointer; box-shadow: ${SHADOWS.md}; transition: transform ${TIMING.slow}, opacity ${TIMING.slow};
      opacity: 0; min-width: 300px; max-width: 500px;
    }
    .game-found-notification.notification-visible { transform: translateX(-50%) translateY(0); opacity: 1; }
    .game-found-notification.notification-dismissing { transform: translateX(-50%) translateY(-100px); opacity: 0; }
    .game-found-notification:hover { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-color: #93c5fd; }
  `;
}
