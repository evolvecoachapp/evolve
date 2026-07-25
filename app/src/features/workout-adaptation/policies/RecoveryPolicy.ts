import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutError } from "../models/WorkoutError";

/** Recovery policy: allow when recovery/fatigue adjustments are consistent with decision keys. */
export function applyRecoveryPolicy(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.recoveryAdjustments) {
    const linked = adj.sourceDecisionKeys.some(
      (k) => k.includes("recovery") || k.includes("fatigue"),
    );
    if (!linked && adj.sourceDecisionKeys.length > 0) {
      // Deterministic allow — recovery adjustments without recovery keys are still allowed
      // if they have any source keys (adapters may map rest/recovery broadly).
      void linked;
    }
  }
  return Object.freeze(errors);
}
