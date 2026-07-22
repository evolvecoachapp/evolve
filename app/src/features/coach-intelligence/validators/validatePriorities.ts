import { isValidCoachPriority } from "../models/CoachPriority";
import type { CoachConstraint } from "../models/CoachConstraint";
import type { CoachEvidence } from "../models/CoachEvidence";
import type { CoachFocus } from "../models/CoachFocus";
import type { CoachInstruction } from "../models/CoachInstruction";
import type { CoachObjective } from "../models/CoachObjective";

/**
 * Soft-validate priorities are in 1–100.
 */
export function validatePriorities(options: {
  readonly objectives: readonly CoachObjective[];
  readonly constraints: readonly CoachConstraint[];
  readonly instructions: readonly CoachInstruction[];
  readonly focus: readonly CoachFocus[];
  readonly evidence: readonly CoachEvidence[];
}): readonly string[] {
  const issues: string[] = [];

  const check = (
    items: readonly { readonly id: string; readonly priority: number }[],
    kind: string,
  ) => {
    for (const item of items) {
      if (!isValidCoachPriority(item.priority)) {
        issues.push(`invalid_${kind}_priority:${item.id}`);
      }
    }
  };

  check(options.objectives, "objective");
  check(options.constraints, "constraint");
  check(options.instructions, "instruction");
  check(options.focus, "focus");
  check(options.evidence, "evidence");

  return issues;
}
