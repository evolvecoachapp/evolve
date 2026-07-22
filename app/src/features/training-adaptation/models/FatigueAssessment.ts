import type { AdaptationReason } from "./AdaptationReason";

export type FatigueLevel = "low" | "moderate" | "high" | "excessive";

export const FATIGUE_LEVELS = Object.freeze([
  "low",
  "moderate",
  "high",
  "excessive",
] as const satisfies readonly FatigueLevel[]);

/**
 * Immutable fatigue signal derived from progression workload structure.
 * No heart rate. No physiological calculations. Domain representation only.
 */
export interface FatigueAssessment {
  readonly level: FatigueLevel;
  /** Higher means more structural fatigue pressure (0–100). */
  readonly score: number;
  readonly reasons: readonly AdaptationReason[];
}
