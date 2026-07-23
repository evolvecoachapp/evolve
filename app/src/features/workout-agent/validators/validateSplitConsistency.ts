import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { freezeValidation } from "../utils/freezeAgentState";

const KNOWN_SPLITS = new Set([
  "full_body",
  "upper_lower",
  "push_pull_legs",
  "upper_lower_hybrid",
]);

export function validateSplitConsistency(
  proposal: WorkoutPlanProposal,
): WorkoutValidation {
  const issues = [];
  if (!KNOWN_SPLITS.has(proposal.split)) {
    issues.push({
      code: WorkoutValidationCodes.SPLIT_INCONSISTENT,
      message: `Unrecognized split: ${proposal.split}`,
      path: "split",
    });
  }
  if (proposal.daysPerWeek <= 3 && proposal.split === "push_pull_legs") {
    issues.push({
      code: WorkoutValidationCodes.SPLIT_INCONSISTENT,
      message: "PPL split inconsistent with <=3 training days.",
      path: "split",
    });
  }
  if (proposal.daysPerWeek < 1 || proposal.daysPerWeek > 7) {
    issues.push({
      code: WorkoutValidationCodes.DAYS_OUT_OF_RANGE,
      message: "daysPerWeek must be between 1 and 7.",
      path: "daysPerWeek",
    });
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
