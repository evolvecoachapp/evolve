import type { CoachEvidence } from "../models/CoachEvidence";
import type { CoachFocus } from "../models/CoachFocus";
import type { CoachInstruction } from "../models/CoachInstruction";
import type { CoachObjective } from "../models/CoachObjective";
import type { CoachConstraint } from "../models/CoachConstraint";

function compareByPriorityThenId(
  a: { readonly priority: number; readonly id: string },
  b: { readonly priority: number; readonly id: string },
): number {
  if (b.priority !== a.priority) {
    return b.priority - a.priority;
  }
  return a.id.localeCompare(b.id);
}

/**
 * Sort evidence by priority desc, then id asc.
 */
export function sortEvidence(
  evidence: readonly CoachEvidence[],
): readonly CoachEvidence[] {
  return [...evidence].sort(compareByPriorityThenId);
}

export function sortObjectives(
  objectives: readonly CoachObjective[],
): readonly CoachObjective[] {
  return [...objectives].sort(compareByPriorityThenId);
}

export function sortConstraints(
  constraints: readonly CoachConstraint[],
): readonly CoachConstraint[] {
  return [...constraints].sort(compareByPriorityThenId);
}

export function sortInstructions(
  instructions: readonly CoachInstruction[],
): readonly CoachInstruction[] {
  return [...instructions].sort(compareByPriorityThenId);
}

export function sortFocus(
  focusItems: readonly CoachFocus[],
): readonly CoachFocus[] {
  return [...focusItems].sort(compareByPriorityThenId);
}
