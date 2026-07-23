import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";
import { validateRecoveryScore } from "./validateRecoveryScore";
import { validateSleep } from "./validateSleep";
import { validateStress } from "./validateStress";
import { validateTrainingLoad } from "./validateTrainingLoad";
import { validateFatigue } from "./validateFatigue";
import { validateDOMS } from "./validateDOMS";
import { validateProtocol } from "./validateProtocol";
import {
  validateConsistency,
  validateSafety,
} from "./validateSafetyAndConsistency";

export function validateRecoveryPlan(plan: RecoveryPlan): RecoveryValidation {
  const parts = [
    validateRecoveryScore(plan.assessment.recoveryScore.score),
    validateSleep(plan.assessment.sleep),
    validateStress(plan.assessment.stress),
    validateTrainingLoad(plan.assessment.trainingLoad),
    validateFatigue(plan.assessment.fatigue),
    validateDOMS(plan.assessment.indicators.sorenessLevel),
    validateProtocol(plan.protocolHint),
    validateSafety(plan),
    validateConsistency(plan),
  ];
  const issues = parts.flatMap((p) => p.issues);
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
