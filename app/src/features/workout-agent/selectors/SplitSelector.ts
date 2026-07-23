import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";

export class SplitSelector {
  select(proposal: WorkoutPlanProposal | null, daysPerWeek: number): string {
    if (proposal?.split) return proposal.split;
    if (daysPerWeek <= 3) return "full_body";
    if (daysPerWeek === 4) return "upper_lower";
    if (daysPerWeek >= 6) return "push_pull_legs";
    return "upper_lower_hybrid";
  }
}
