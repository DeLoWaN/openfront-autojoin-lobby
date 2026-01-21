/**
 * Design system tokens for consistent theming
 * These values are used throughout the UI and in CSS generation
 */

export const COLORS = {
  bgPrimary: "rgba(10, 14, 22, 0.92)",
  bgSecondary: "rgba(18, 26, 40, 0.75)",
  bgHover: "rgba(35, 48, 70, 0.6)",
  textPrimary: "#e7f1ff",
  textSecondary: "rgba(231, 241, 255, 0.7)",
  textMuted: "rgba(231, 241, 255, 0.5)",
  accent: "rgba(46, 211, 241, 0.95)",
  accentHover: "rgba(99, 224, 255, 0.95)",
  accentMuted: "rgba(46, 211, 241, 0.18)",
  accentAlt: "rgba(99, 110, 255, 0.9)",
  success: "rgba(20, 220, 170, 0.9)",
  successSolid: "#38d9a9",
  warning: "#f2c94c",
  error: "#ff7d87",
  highlight: "rgba(88, 211, 255, 0.2)",
  border: "rgba(120, 140, 180, 0.3)",
  borderAccent: "rgba(46, 211, 241, 0.55)",
} as const;

export const FONTS = {
  display: "'Trebuchet MS', 'Segoe UI', Tahoma, Verdana, sans-serif",
  body: "'Segoe UI', Tahoma, Verdana, sans-serif",
  mono: "'Consolas', 'Courier New', monospace",
} as const;

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  xxl: "24px",
} as const;

export const RADIUS = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
} as const;

export const SHADOWS = {
  sm: "0 2px 8px rgba(3, 8, 18, 0.35)",
  md: "0 10px 22px rgba(3, 8, 18, 0.45)",
  lg: "0 24px 40px rgba(2, 6, 16, 0.55), 0 0 24px rgba(46, 211, 241, 0.08)",
} as const;

export const TIMING = {
  fast: "0.12s",
  normal: "0.2s",
  slow: "0.3s",
} as const;
