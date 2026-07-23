import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { freezeValidation } from "../utils/freezeAgentState";

export function validateProgression(
  proposal: WorkoutPlanProposal,
): WorkoutValidation {
  const issues = [];
  if (!proposal.progressionCue) {
    issues.push({
      code: WorkoutValidationCodes.PROGRESSION_UNSAFE,
      message: "Missing progression cue.",
      path: "progressionCue",
    });
  }
  if (proposal.deloadRecommended && proposal.intensityScore > 0.75) {
    issues.push({
      code: WorkoutValidationCodes.PROGRESSION_UNSAFE,
      message: "Deload with high intensity is unsafe.",
      path: "intensityScore",
    });
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
