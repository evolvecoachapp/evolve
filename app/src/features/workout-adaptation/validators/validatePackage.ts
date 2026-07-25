import type { WorkoutError } from "../models/WorkoutError";
import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { validateAdaptationIntegrity } from "./validateAdaptationIntegrity";
import { validateBlueprintIntegrity } from "./validateBlueprintIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateExerciseConsistency } from "./validateExerciseConsistency";
import { validateHistory } from "./validateHistory";
import { validateSnapshot } from "./validateSnapshot";
import { validateWeeklyConsistency } from "./validateWeeklyConsistency";

export function validateWorkoutPackage(pkg: WorkoutPackage): WorkoutValidation {
  const issues: WorkoutError[] = [
    ...validateAdaptationIntegrity(pkg.adaptation),
    ...validateBlueprintIntegrity(pkg.updatedBlueprint),
    ...validateExerciseConsistency(pkg.adaptation),
    ...validateWeeklyConsistency(pkg.adaptation),
    ...validateDependencies(pkg.adaptation),
    ...validateHistory(pkg.history),
    ...validateSnapshot(pkg.snapshot),
  ];
  if (!pkg.athleteId) {
    issues.push(
      createWorkoutError(WorkoutErrorCodes.MISSING_ATHLETE, "Package athlete id required", pkg.id),
    );
  }
  if (!pkg.blueprintId) {
    issues.push(
      createWorkoutError(
        WorkoutErrorCodes.MISSING_BLUEPRINT,
        "Package blueprint id required",
        pkg.id,
      ),
    );
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
