import type { WorkoutPlan } from "../models/WorkoutPlan";
import type {
  WorkoutPlanValidation,
  WorkoutPlanValidationIssue,
} from "../models/WorkoutPlanValidation";
import { WorkoutPlanValidationCodes } from "../models/WorkoutPlanValidation";
import { validateWorkoutPlanIntegrity } from "../validators/validateWorkoutPlanIntegrity";

function issue(
  code: WorkoutPlanValidationIssue["code"],
  message: string,
  blocking = true,
): WorkoutPlanValidationIssue {
  return Object.freeze({ code, message, blocking });
}

/**
 * Validate an adaptively modified WorkoutPlan.
 * Reuses integrity validation and adds modification-specific checks.
 */
export function validateModifiedWorkoutPlan(
  plan: WorkoutPlan,
  previous: WorkoutPlan,
): WorkoutPlanValidation {
  const base = validateWorkoutPlanIntegrity(
    plan,
    plan.recommendationPackage,
  );
  const issues: WorkoutPlanValidationIssue[] = [...base.issues];

  if (plan.primarySession.exercises.length === 0) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.INTEGRITY,
        "Modified plan must retain at least one exercise",
      ),
    );
  }

  for (const exercise of plan.primarySession.exercises) {
    if (exercise.setCount < 1 || exercise.sets.length < 1) {
      issues.push(
        issue(
          WorkoutPlanValidationCodes.INTEGRITY,
          `Exercise ${exercise.name} has invalid set count after modification`,
        ),
      );
    }
    if (exercise.estimatedDurationSeconds <= 0) {
      issues.push(
        issue(
          WorkoutPlanValidationCodes.INTEGRITY,
          `Exercise ${exercise.name} has non-positive duration`,
        ),
      );
    }
  }

  if (plan.athleteId !== previous.athleteId) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.CONSTRAINTS,
        "Modified plan athleteId must match source plan",
      ),
    );
  }

  if (plan.progression.weekNumber !== previous.progression.weekNumber) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.PROGRESSION,
        "Adaptive modification must preserve progression week number",
      ),
    );
  }

  if (
    plan.objectives.primary.length === 0 ||
    plan.objectives.primary !== previous.objectives.primary
  ) {
    // Primary objective should stay unless empty (focus may add areas).
    if (plan.objectives.primary.length === 0) {
      issues.push(
        issue(
          WorkoutPlanValidationCodes.GOALS,
          "Primary training objective missing after modification",
        ),
      );
    }
  }

  if (
    plan.recommendationPackageId !== previous.recommendationPackageId &&
    previous.recommendationPackageId !== null
  ) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.RECOMMENDATION,
        "Recommendation package identity changed unexpectedly",
        false,
      ),
    );
  }

  if (
    plan.constraints.recoveryConstraints.includes("deload_recommended") &&
    !plan.progression.deloadRecommended
  ) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.RECOVERY,
        "Recovery constraints request deload but progression does not",
      ),
    );
  }

  const equipmentNotes = plan.constraints.athleteConstraints.filter((item) =>
    item.startsWith("equipment_unavailable:"),
  );
  if (equipmentNotes.length > 0 && plan.primarySession.exercises.length === 0) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.CONSTRAINTS,
        "Equipment adaptation produced an empty session",
      ),
    );
  }

  const frozen = Object.freeze([...issues]);
  return Object.freeze({
    valid: frozen.every((item) => !item.blocking),
    issues: frozen,
  });
}
