import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { freezeValidation } from "../utils/freezeAgentState";

export function validateRecovery(
  proposal: WorkoutPlanProposal,
): WorkoutValidation {
  const issues = [];
  if (
    proposal.objective === "recovery" &&
    !proposal.deloadRecommended &&
    proposal.intensityScore > 0.5
  ) {
    issues.push({
      code: WorkoutValidationCodes.RECOVERY_INSUFFICIENT,
      message: "Recovery objective requires deload or reduced intensity.",
      path: "recovery",
    });
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
