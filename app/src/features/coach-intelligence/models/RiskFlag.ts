/** Machine-readable risk codes produced by coach intelligence detectors. */
export type RiskFlagCode =
  | "long_inactivity"
  | "volume_spike"
  | "high_frequency"
  | "elevated_fatigue"
  | "exercise_stagnation";

export type RiskSeverity = "low" | "medium" | "high";

/**
 * Structured risk signal — evidence only, no prose.
 */
export interface RiskFlag {
  readonly code: RiskFlagCode;
  readonly severity: RiskSeverity;
  /** Numeric / categorical evidence payload for downstream consumers. */
  readonly evidence: Readonly<
    Record<string, number | string | boolean | null>
  >;
}
