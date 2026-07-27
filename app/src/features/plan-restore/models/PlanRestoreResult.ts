import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";
import type { PlanVersion } from "../../plan-history/models/PlanVersion";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { PlanRestorePreview } from "./PlanRestorePreview";
import type { PlanRestoreRequest } from "./PlanRestoreRequest";
import type { PlanRestoreValidation } from "./PlanRestoreValidation";
import type { RestoreConflict } from "./RestoreConflict";

/**
 * Immutable outcome of a restore attempt.
 * Success always means a brand-new published version.
 */
export interface PlanRestoreResult {
  readonly id: string;
  readonly success: boolean;
  readonly message: string;
  readonly request: PlanRestoreRequest;
  readonly preview: PlanRestorePreview | null;
  readonly validation: PlanRestoreValidation | null;
  readonly publishedVersion: PlanVersion | null;
  readonly publishedSnapshot: PlanSnapshot | null;
  readonly workoutPlan: WorkoutPlan | null;
  readonly nutritionPlan: NutritionPlan | null;
  readonly conflicts: readonly RestoreConflict[];
  readonly restoredSummary: string;
  readonly revertedSummary: string;
  readonly restoreReason: string;
  readonly progressionImpact: string;
  readonly startedAt: string;
  readonly completedAt: string;
}
