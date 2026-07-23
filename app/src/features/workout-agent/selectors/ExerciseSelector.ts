import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";

/** Selects primary / accessory exercise ids from a plan proposal. */
export class ExerciseSelector {
  selectPrimaries(proposal: WorkoutPlanProposal | null): readonly string[] {
    return Object.freeze([...(proposal?.primaryLifts ?? [])]);
  }

  selectAccessories(proposal: WorkoutPlanProposal | null): readonly string[] {
    return Object.freeze([...(proposal?.accessories ?? [])]);
  }
}
