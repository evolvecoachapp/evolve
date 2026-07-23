import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface StressPolicy {
  readonly id: string;
  evaluate(plan: RecoveryPlan | null): readonly string[];
}

export class DefaultStressPolicy implements StressPolicy {
  readonly id = "policy:recovery:stress";

  evaluate(plan: RecoveryPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    if (plan.assessment.stress.level >= 90) flags.push("stress_critically_high");
    if (plan.stressCeiling > 90) flags.push("stress_ceiling_too_high");
    return Object.freeze(flags);
  }
}
