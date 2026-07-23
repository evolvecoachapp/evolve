import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface SleepPolicy {
  readonly id: string;
  evaluate(plan: RecoveryPlan | null): readonly string[];
}

export class DefaultSleepPolicy implements SleepPolicy {
  readonly id = "policy:recovery:sleep";

  evaluate(plan: RecoveryPlan | null): readonly string[] {
    const flags: string[] = [];
    if (!plan) return Object.freeze(flags);
    if (plan.sleepHoursTarget < 6) flags.push("sleep_hours_target_too_low");
    if (plan.assessment.sleep.quality < 20) flags.push("sleep_quality_critically_low");
    return Object.freeze(flags);
  }
}
