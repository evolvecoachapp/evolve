export type InjurySeverity = "mild" | "moderate" | "severe";

export const INJURY_SEVERITIES: readonly InjurySeverity[] = Object.freeze([
  "mild",
  "moderate",
  "severe",
]);

/** Single structured injury / limitation entry. */
export interface InjuryEntry {
  readonly id: string;
  readonly bodyRegion: string;
  readonly severity: InjurySeverity;
  readonly notes: string | null;
  readonly active: boolean;
}

/**
 * Active and historical injury constraints.
 *
 * Facts only — no clinical advice or natural language coaching.
 */
export interface InjuryProfile {
  readonly injuries: readonly InjuryEntry[];
}
