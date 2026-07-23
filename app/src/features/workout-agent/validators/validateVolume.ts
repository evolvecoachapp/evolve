import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { isVolumeInRange } from "../utils/volumeHelpers";
import { freezeValidation } from "../utils/freezeAgentState";

export function validateVolume(proposal: WorkoutPlanProposal): WorkoutValidation {
  const issues = [];
  if (!isVolumeInRange(proposal.volumeScore)) {
    issues.push({
      code: WorkoutValidationCodes.VOLUME_OUT_OF_RANGE,
      message: `Volume score out of range: ${proposal.volumeScore}`,
      path: "volumeScore",
    });
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
