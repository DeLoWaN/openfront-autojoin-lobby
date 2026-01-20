/**
 * Design system tokens for consistent theming
 * These values are used throughout the UI and in CSS generation
 */

export const COLORS = {
  bgPrimary: "rgba(28, 32, 40, 0.95)",
  bgSecondary: "rgba(0, 0, 0, 0.12)",
  bgHover: "rgba(100, 125, 180, 0.12)",
  textPrimary: "#eaf2ff",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  accent: "rgba(59, 130, 246, 0.8)",
  accentHover: "rgba(96, 165, 250, 0.9)",
  accentMuted: "rgba(59, 130, 246, 0.2)",
  success: "rgba(16, 185, 129, 0.8)",
  successSolid: "#5fd785",
  warning: "#ffc352",
  error: "#ff7575",
  highlight: "rgba(255, 235, 133, 0.18)",
  border: "rgba(100, 115, 145, 0.15)",
  borderAccent: "rgba(59, 130, 246, 0.4)",
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
  sm: "0 2px 4px rgba(0, 0, 0, 0.2)",
  md: "0 4px 12px rgba(0, 0, 0, 0.3)",
  lg: "0 8px 24px rgba(20, 25, 38, 0.3)",
} as const;

export const TIMING = {
  fast: "0.12s",
  normal: "0.2s",
  slow: "0.3s",
} as const;
