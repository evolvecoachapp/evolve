import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";

export interface ProgressionPolicy {
  readonly id: string;
  evaluate(proposal: WorkoutPlanProposal | null): readonly string[];
}

export class DefaultProgressionPolicy implements ProgressionPolicy {
  readonly id = "policy:workout:progression";

  evaluate(proposal: WorkoutPlanProposal | null): readonly string[] {
    if (!proposal) return Object.freeze([]);
    const flags: string[] = [];
    if (!proposal.progressionCue) {
      flags.push("missing_progression_cue");
    }
    if (proposal.deloadRecommended && proposal.intensityScore > 0.7) {
      flags.push("deload_with_high_intensity");
    }
    return Object.freeze(flags);
  }
}
