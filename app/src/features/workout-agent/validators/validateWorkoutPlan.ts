import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { freezeValidation } from "../utils/freezeAgentState";
import { validateExerciseCompatibility } from "./validateExerciseCompatibility";
import { validateIntensity } from "./validateIntensity";
import { validateProgression } from "./validateProgression";
import { validateRecovery } from "./validateRecovery";
import { validateSplitConsistency } from "./validateSplitConsistency";
import { validateTrainingObjective } from "./validateTrainingObjective";
import { validateVolume } from "./validateVolume";

export function validateWorkoutPlan(
  proposal: WorkoutPlanProposal,
): WorkoutValidation {
  const parts = [
    validateTrainingObjective(proposal.objective),
    validateSplitConsistency(proposal),
    validateExerciseCompatibility(proposal),
    validateVolume(proposal),
    validateIntensity(proposal),
    validateRecovery(proposal),
    validateProgression(proposal),
  ];
  const issues = parts.flatMap((p) => p.issues);
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
