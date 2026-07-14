import { Easing } from "react-native-reanimated";

/**
 * Centralized motion tokens — durations, easings, and spring configs.
 * All decorative animations should reference these values.
 */
export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 220,
    medium: 320,
    slow: 480,
    progress: 600,
    breathe: 4200,
    glow: 3200,
    shimmer: 1200,
  },
  easing: {
    standard: Easing.bezier(0.25, 0.1, 0.25, 1),
    enter: Easing.bezier(0, 0, 0.2, 1),
    exit: Easing.bezier(0.4, 0, 1, 1),
    smooth: Easing.bezier(0.22, 1, 0.36, 1),
  },
  spring: {
    press: { damping: 16, stiffness: 320, mass: 0.75 },
    release: { damping: 14, stiffness: 210, mass: 0.9 },
    floating: { damping: 13, stiffness: 170, mass: 1 },
  },
  enter: {
    translateY: 10,
    opacityFrom: 0,
    staggerDelay: 48,
    chipStaggerDelay: 56,
    chipScaleFrom: 0.96,
  },
  breathe: {
    scaleMin: 0.965,
    scaleMax: 1,
    opacityMin: 0.72,
    opacityMax: 0.9,
  },
  glow: {
    opacityMin: 0.5,
    opacityMax: 0.82,
    scaleMin: 0.98,
    scaleMax: 1.02,
  },
} as const;
