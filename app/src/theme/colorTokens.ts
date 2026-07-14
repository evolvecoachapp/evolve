/**
 * Semantic color contract shared by light and dark palettes.
 * Consumers should prefer semantic tokens (`ink`, `pulse`, `canvas`) over legacy aliases.
 */
export interface ColorPalette {
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  canvas: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  pulse: string;
  pulseMuted: string;
  warm: string;
  warmMuted: string;
  critical: string;
  success: string;
  overlay: string;
  overlayStrong: string;
  glass: string;
  scrim: string;
  /** Soft canvas gradient — top stop. */
  gradientCanvasStart: string;
  /** Soft canvas gradient — bottom stop. */
  gradientCanvasEnd: string;
  /** Hero accent wash — top. */
  gradientHeroStart: string;
  /** Hero accent wash — bottom. */
  gradientHeroEnd: string;
  /** Subtle pulse glow for depth accents. */
  glowPulse: string;
  /** Warm ambient glow. */
  glowWarm: string;
  /** Glass surface hairline border. */
  borderGlass: string;
  /** Accent-tinted border for pulse surfaces. */
  borderPulse: string;
  /** Warm-tinted border for warm surfaces. */
  borderWarm: string;
  /** Text on ink/dark surfaces. */
  textOnInk: string;
  /** Muted text on ink/dark surfaces. */
  textOnInkMuted: string;
  /** Subtle destructive fill. */
  criticalMuted: string;
  /** Progress gradient end stop. */
  pulseGradientEnd: string;
  /** @deprecated Use `ink` */
  primary: string;
  /** @deprecated Use `inkSecondary` */
  primaryLight: string;
  /** @deprecated Use `pulse` */
  accent: string;
  /** @deprecated Use `warm` */
  accentWarm: string;
  /** @deprecated Use `canvas` */
  background: string;
  /** @deprecated Use `ink` */
  text: string;
  /** @deprecated Use `inkSecondary` */
  textSecondary: string;
  /** @deprecated Use `inkMuted` */
  textMuted: string;
  /** @deprecated Use `critical` */
  error: string;
}

export type ThemeMode = "light" | "dark";
