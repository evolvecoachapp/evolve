import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { isIntensityInRange } from "../utils/intensityHelpers";
import { freezeValidation } from "../utils/freezeAgentState";

export function validateIntensity(
  proposal: WorkoutPlanProposal,
): WorkoutValidation {
  const issues = [];
  if (!isIntensityInRange(proposal.intensityScore)) {
    issues.push({
      code: WorkoutValidationCodes.INTENSITY_OUT_OF_RANGE,
      message: `Intensity score out of range: ${proposal.intensityScore}`,
      path: "intensityScore",
    });
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
