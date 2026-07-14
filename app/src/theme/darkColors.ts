import type { ColorPalette } from "./colorTokens";

const ink = "#FAFAFA";
const inkSecondary = "#A1A1AA";
const inkMuted = "#52525B";
const canvas = "#0C0C0E";
const surface = "#151518";
const surfaceElevated = "#1F1F23";
const pulse = "#5EEAD4";
const warm = "#FBBF24";

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
  border: "rgba(250,250,250,0.08)",
  borderStrong: "rgba(250,250,250,0.14)",
  pulse,
  pulseMuted: "rgba(94,234,212,0.15)",
  warm,
  warmMuted: "rgba(251,191,36,0.15)",
  critical: "#F87171",
  success: "#4ADE80",
  overlay: "rgba(250,250,250,0.04)",
  overlayStrong: "rgba(250,250,250,0.08)",
  glass: "rgba(31,31,35,0.78)",
  scrim: "rgba(12,12,14,0.6)",
  gradientCanvasStart: "#0C0C0E",
  gradientCanvasEnd: "#121214",
  gradientHeroStart: "rgba(94,234,212,0.06)",
  gradientHeroEnd: "rgba(12,12,14,0)",
  glowPulse: "rgba(94,234,212,0.15)",
  glowWarm: "rgba(251,191,36,0.1)",
  borderGlass: "rgba(250,250,250,0.1)",
  borderPulse: "rgba(94,234,212,0.22)",
  borderWarm: "rgba(251,191,36,0.22)",
  textOnInk: canvas,
  textOnInkMuted: "rgba(250,250,250,0.55)",
  criticalMuted: "rgba(248,113,113,0.15)",
  pulseGradientEnd: "rgba(94,234,212,0.55)",
};

/** Premium dark-mode palette — layered zinc surfaces, no pure black. */
export const darkColors: ColorPalette = {
  ...palette,
  primary: ink,
  primaryLight: "#E4E4E7",
  accent: pulse,
  accentWarm: warm,
  background: canvas,
  text: ink,
  textSecondary: inkSecondary,
  textMuted: inkMuted,
  error: palette.critical,
};
