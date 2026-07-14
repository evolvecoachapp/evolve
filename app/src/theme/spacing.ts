export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  /** Horizontal screen inset — increased for premium breathing room. */
  screenPadding: 24,
  /** Gap between major sections on scroll screens. */
  section: 28,
  /** Default internal card padding. */
  cardPadding: 20,
  /** Gap between elements inside a card. */
  cardGap: 12,
  /** Icon sizes — consistent across chips, buttons, and badges. */
  icon: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 22,
    xl: 24,
    tab: 24,
    tabFocused: 26,
  },
  /** Avatar and badge ring sizes. */
  avatar: {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 72,
  },
  badge: {
    sm: 22,
    md: 28,
    lg: 36,
  },
  /** Minimum width for floating stat chips. */
  floatingChipMinWidth: 108,
  /** Vertical divider height in stat rows. */
  statDividerHeight: 36,
  /** Two-column grid cell width. */
  gridHalfWidth: "47%" as const,
  /** Chart placeholder heights. */
  chart: {
    sm: 120,
    md: 140,
  },
  /** Press and disabled feedback values. */
  interaction: {
    pressedScale: 0.96,
    pressedScaleSubtle: 0.97,
    pressedScaleCard: 0.985,
    pressedOpacity: 0.92,
    chipPressedOpacity: 0.85,
    disabledOpacity: 0.4,
    sendDisabledOpacity: 0.72,
  },
} as const;
