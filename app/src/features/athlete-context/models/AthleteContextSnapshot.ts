import type { AthleteContextValidationResult } from "./AthleteContextValidationResult";
import type { AthleteProfile } from "./AthleteProfile";

/**
 * Immutable athlete context bundle for downstream consumers.
 *
 * Prompt Builder and Coach Intelligence read this snapshot — never mutate it.
 */
export interface AthleteContextSnapshot {
  readonly profile: AthleteProfile;
  /**
   * Derived training age in whole years, or null when unknown.
   * Computed via `calculateTrainingAge` — not stored independently.
   */
  readonly trainingAgeYears: number | null;
  readonly validation: AthleteContextValidationResult;
  /** ISO-8601 timestamp when this snapshot was captured. */
  readonly capturedAt: string;
}
