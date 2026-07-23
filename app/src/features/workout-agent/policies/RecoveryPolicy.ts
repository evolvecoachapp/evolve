import type { WorkoutContext } from "../models/WorkoutContext";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";

export interface RecoveryPolicy {
  readonly id: string;
  evaluate(
    context: WorkoutContext,
    proposal: WorkoutPlanProposal | null,
  ): readonly string[];
}

export class DefaultRecoveryPolicy implements RecoveryPolicy {
  readonly id = "policy:workout:recovery";

  evaluate(
    context: WorkoutContext,
    proposal: WorkoutPlanProposal | null,
  ): readonly string[] {
    const flags: string[] = [];
    const recoveryRequested =
      context.objective === "recovery" ||
      context.constraints.includes("needs_recovery");
    if (recoveryRequested && proposal && !proposal.deloadRecommended) {
      flags.push("recovery_without_deload");
    }
    if (proposal && proposal.daysPerWeek >= 6 && !proposal.deloadRecommended) {
      flags.push("high_frequency_without_deload_note");
    }
    return Object.freeze(flags);
  }
}
