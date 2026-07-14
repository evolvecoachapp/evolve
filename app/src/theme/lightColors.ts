import type { ColorPalette } from "./colorTokens";

const ink = "#0C0C0E";
const inkSecondary = "#52525B";
const inkMuted = "#A1A1AA";
const canvas = "#ECEAE6";
const surface = "#F7F6F4";
const surfaceElevated = "#FFFFFF";
const pulse = "#2DD4BF";
const warm = "#F59E0B";

const palette: Omit<
  ColorPalette,
  "primary" | "primaryLight" | "accent" | "accentWarm" | "background" | "text" | "textSecondary" | "textMuted" | "error"
> = {
  ink,
  inkSecondary,
  inkMuted,
  canvas,
  surface,
  surfaceElevated,
  border: "rgba(12,12,14,0.08)",
  borderStrong: "rgba(12,12,14,0.14)",
  pulse,
  pulseMuted: "rgba(45,212,191,0.12)",
  warm,
  warmMuted: "rgba(245,158,11,0.12)",
  critical: "#EF4444",
  success: "#22C55E",
  overlay: "rgba(12,12,14,0.04)",
  overlayStrong: "rgba(12,12,14,0.08)",
  glass: "rgba(255,255,255,0.72)",
  scrim: "rgba(12,12,14,0.4)",
  gradientCanvasStart: "#ECEAE6",
  gradientCanvasEnd: "#E2DFDB",
  gradientHeroStart: "rgba(45,212,191,0.08)",
  gradientHeroEnd: "rgba(236,234,230,0)",
  glowPulse: "rgba(45,212,191,0.18)",
  glowWarm: "rgba(245,158,11,0.12)",
  borderGlass: "rgba(255,255,255,0.16)",
  borderPulse: "rgba(45,212,191,0.2)",
  borderWarm: "rgba(245,158,11,0.2)",
  textOnInk: canvas,
  textOnInkMuted: "rgba(255,255,255,0.62)",
  criticalMuted: "rgba(239,68,68,0.12)",
  pulseGradientEnd: "rgba(45,212,191,0.6)",
};

/** Active light-mode palette (default). */
export const lightColors: ColorPalette = {
  ...palette,
  primary: ink,
  primaryLight: "#27272A",
  accent: pulse,
  accentWarm: warm,
  background: canvas,
  text: ink,
  textSecondary: inkSecondary,
  textMuted: inkMuted,
  error: palette.critical,
};
