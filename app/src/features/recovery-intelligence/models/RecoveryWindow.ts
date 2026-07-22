/**
 * Deterministic recovery window derived from fatigue score.
 * Descriptive time bounds only — not a coaching recommendation.
 */
export interface RecoveryWindow {
  readonly startAt: string;
  readonly endAt: string;
  readonly durationHours: number;
  readonly durationMs: number;
}
