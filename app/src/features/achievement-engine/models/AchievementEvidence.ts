/**
 * Immutable evidence that an achievement was earned.
 * Metric-specific details live in attributes for extensibility.
 */
export interface AchievementEvidence {
  readonly metricKey: string;
  readonly currentValue: number;
  /** Null when no prior baseline existed (first recorded value). */
  readonly previousValue: number | null;
  readonly unit: string;
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}
