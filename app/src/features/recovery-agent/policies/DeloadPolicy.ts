import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryPlan } from "../models/RecoveryPlan";

export interface DeloadPolicy {
  readonly id: string;
  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[];
}

export class DefaultDeloadPolicy implements DeloadPolicy {
  readonly id = "policy:recovery:deload";

  evaluate(
    context: RecoveryContext,
    plan: RecoveryPlan | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (
      context.constraints.avoidDeload &&
      plan?.deloadRecommendation.recommended
    ) {
      flags.push("deload_conflicts_with_constraint");
    }
    return Object.freeze(flags);
  }
}
