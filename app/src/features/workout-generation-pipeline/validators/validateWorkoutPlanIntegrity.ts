import type { RecommendationPackage } from "../../recommendation-engine/models/RecommendationPackage";
import type { WorkoutPlan } from "../models/WorkoutPlan";
import type {
  WorkoutPlanValidation,
  WorkoutPlanValidationIssue,
} from "../models/WorkoutPlanValidation";
import { WorkoutPlanValidationCodes } from "../models/WorkoutPlanValidation";

function issue(
  code: WorkoutPlanValidationIssue["code"],
  message: string,
  blocking = true,
): WorkoutPlanValidationIssue {
  return Object.freeze({ code, message, blocking });
}

/**
 * Validate WorkoutPlan integrity against pipeline / recommendation / athlete constraints.
 */
export function validateWorkoutPlanIntegrity(
  plan: WorkoutPlan,
  recommendationPackage: RecommendationPackage | null,
): WorkoutPlanValidation {
  const issues: WorkoutPlanValidationIssue[] = [];

  if (!plan.primarySession || plan.primarySession.exercises.length === 0) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.INTEGRITY,
        "WorkoutPlan primary session must include exercises",
      ),
    );
  }

  const orders = plan.primarySession.exercises.map((item) => item.order);
  const sorted = [...orders].sort((a, b) => a - b);
  if (orders.some((value, index) => value !== sorted[index])) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.ORDERING,
        "Exercise ordering must be ascending by order field",
      ),
    );
  }

  if (plan.progression.weekNumber < 1) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.PROGRESSION,
        "Progression week number must be >= 1",
      ),
    );
  }

  if (
    plan.progression.deloadRecommended &&
    plan.metrics.intensityScore > 90
  ) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.PROGRESSION,
        "Deload recommended but intensity score remains very high",
        false,
      ),
    );
  }

  if (recommendationPackage) {
    const trainingRecs = recommendationPackage.recommendations.filter(
      (item) => item.category === "training",
    );
    if (
      trainingRecs.length > 0 &&
      plan.statistics.recommendationCount === 0
    ) {
      issues.push(
        issue(
          WorkoutPlanValidationCodes.RECOMMENDATION,
          "Training recommendations exist but plan statistics report zero",
        ),
      );
    }
  }

  if (plan.constraints.athleteConstraints.some((c) => c.includes("blocked"))) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.CONSTRAINTS,
        "Athlete constraints include a blocking flag",
      ),
    );
  }

  if (plan.objectives.primary.length === 0) {
    issues.push(
      issue(WorkoutPlanValidationCodes.GOALS, "Primary objective is required"),
    );
  }

  if (plan.proposal.daysPerWeek < 1 || plan.proposal.daysPerWeek > 7) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.AVAILABILITY,
        "daysPerWeek must be between 1 and 7",
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

  if (plan.warnings.blocking) {
    issues.push(
      issue(
        WorkoutPlanValidationCodes.INTEGRITY,
        "Generation produced blocking validation warnings",
      ),
    );
  }

  const frozen = Object.freeze([...issues]);
  return Object.freeze({
    valid: frozen.every((item) => !item.blocking),
    issues: frozen,
  });
}
