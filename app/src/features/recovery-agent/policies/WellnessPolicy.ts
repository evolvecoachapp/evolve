import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface WellnessPolicy {
  readonly id: string;
  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[];
}

export class DefaultWellnessPolicy implements WellnessPolicy {
  readonly id = "policy:recovery:wellness";

  evaluate(
    context: RecoveryContext,
    _plan: RecoveryPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (
      context.stress.level >= 70 &&
      context.sleep.quality < 40 &&
      context.fatigue.level >= 70
    ) {
      flags.push("wellness_cluster_degraded");
    }
    return Object.freeze(flags);
  }
}
