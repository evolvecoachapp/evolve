import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface FatiguePolicy {
  readonly id: string;
  evaluate(plan: RecoveryPlan | null): readonly string[];
}

export class DefaultFatiguePolicy implements FatiguePolicy {
  readonly id = "policy:recovery:fatigue";

  evaluate(plan: RecoveryPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    if (plan.assessment.fatigue.level >= 90) flags.push("fatigue_critically_high");
    return Object.freeze(flags);
  }
}
