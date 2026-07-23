import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface RecoveryPolicy {
  readonly id: string;
  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[];
}

export class DefaultRecoveryPolicy implements RecoveryPolicy {
  readonly id = "policy:recovery:recovery";

  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (context.indicators.recoveryScore < 25) {
      flags.push("recovery_score_critically_low");
    }
    if (plan && plan.recoveryScoreTarget < plan.assessment.recoveryScore.score) {
      flags.push("recovery_target_below_current");
    }
    return Object.freeze(flags);
  }
}
