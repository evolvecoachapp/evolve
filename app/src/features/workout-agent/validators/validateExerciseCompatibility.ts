import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { freezeValidation } from "../utils/freezeAgentState";

export function validateExerciseCompatibility(
  proposal: WorkoutPlanProposal,
): WorkoutValidation {
  const issues = [];
  if (proposal.primaryLifts.length === 0) {
    issues.push({
      code: WorkoutValidationCodes.MISSING_PRIMARY_LIFTS,
      message: "At least one primary lift is required.",
      path: "primaryLifts",
    });
  }
  const all = [...proposal.primaryLifts, ...proposal.accessories];
  const seen = new Set<string>();
  for (const id of all) {
    const key = id.toLowerCase();
    if (seen.has(key)) {
      issues.push({
        code: WorkoutValidationCodes.EXERCISE_INCOMPATIBLE,
        message: `Duplicate exercise id: ${id}`,
        path: "exercises",
      });
    }
    seen.add(key);
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
