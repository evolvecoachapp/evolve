import type { TrainingLoad } from "../models/TrainingLoad";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateTrainingLoad(load: TrainingLoad): RecoveryValidation {
  const issues = [];
  if (load.score < 0 || load.score > 100) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_TRAINING_LOAD,
        message: `Invalid training load: ${load.score}`,
        path: "trainingLoad.score",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
