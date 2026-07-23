import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface SafetyPolicy {
  readonly id: string;
  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[];
}

export class DefaultSafetyPolicy implements SafetyPolicy {
  readonly id = "policy:recovery:safety";

  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (context.constraints.medicalClearanceRequired) {
      flags.push("medical_clearance_required");
    }
    if (plan && plan.assessment.indicators.sorenessLevel > 100) {
      flags.push("soreness_out_of_range");
    }
    if (context.indicators.recoveryScore < 0 || context.indicators.recoveryScore > 100) {
      flags.push("recovery_score_out_of_range");
    }
    return Object.freeze(flags);
  }
}
