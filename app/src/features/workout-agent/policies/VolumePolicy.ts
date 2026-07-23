import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import { isVolumeInRange } from "../utils/volumeHelpers";

export interface VolumePolicy {
  readonly id: string;
  evaluate(proposal: WorkoutPlanProposal | null): readonly string[];
}

export class DefaultVolumePolicy implements VolumePolicy {
  readonly id = "policy:workout:volume";

  evaluate(proposal: WorkoutPlanProposal | null): readonly string[] {
    if (!proposal) return Object.freeze([]);
    const flags: string[] = [];
    if (!isVolumeInRange(proposal.volumeScore)) {
      flags.push("volume_out_of_range");
    }
    return Object.freeze(flags);
  }
}
