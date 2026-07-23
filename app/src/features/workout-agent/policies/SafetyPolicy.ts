import type { WorkoutContext } from "../models/WorkoutContext";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";

export interface SafetyPolicy {
  readonly id: string;
  evaluate(
    context: WorkoutContext,
    proposal: WorkoutPlanProposal | null,
  ): readonly string[];
}

export class DefaultSafetyPolicy implements SafetyPolicy {
  readonly id = "policy:workout:safety";

  evaluate(
    context: WorkoutContext,
    proposal: WorkoutPlanProposal | null,
  ): readonly string[] {
    const flags: string[] = [];
    if (context.daysPerWeek < 1 || context.daysPerWeek > 7) {
      flags.push("unsafe_days_per_week");
    }
    if (proposal && proposal.intensityScore > 0.95) {
      flags.push("intensity_too_high");
    }
    if (
      proposal &&
      context.experienceLevel === "beginner" &&
      proposal.primaryLifts.length > 5
    ) {
      flags.push("too_many_primaries_for_beginner");
    }
    return Object.freeze(flags);
  }
}
