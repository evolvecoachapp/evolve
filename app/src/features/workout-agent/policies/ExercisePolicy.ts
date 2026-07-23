import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";

export interface ExercisePolicy {
  readonly id: string;
  evaluate(proposal: WorkoutPlanProposal | null): readonly string[];
}

export class DefaultExercisePolicy implements ExercisePolicy {
  readonly id = "policy:workout:exercise";

  evaluate(proposal: WorkoutPlanProposal | null): readonly string[] {
    if (!proposal) return Object.freeze([]);
    const flags: string[] = [];
    if (proposal.primaryLifts.length === 0) {
      flags.push("missing_primary_lifts");
    }
    const duplicates = findDuplicates([
      ...proposal.primaryLifts,
      ...proposal.accessories,
    ]);
    if (duplicates.length > 0) {
      flags.push(`duplicate_exercises:${duplicates.join(",")}`);
    }
    return Object.freeze(flags);
  }
}

function findDuplicates(items: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) dups.add(item);
    else seen.add(key);
  }
  return Object.freeze([...dups]);
}
