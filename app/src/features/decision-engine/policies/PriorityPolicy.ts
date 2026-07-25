import type { CoachingDecision } from "../models/CoachingDecision";

export function applyPriorityPolicy(
  decisions: readonly CoachingDecision[],
): readonly string[] {
  const warnings: string[] = [];
  for (let i = 1; i < decisions.length; i++) {
    if (decisions[i]!.priority.ordinal < decisions[i - 1]!.priority.ordinal) {
      warnings.push("priority_order_violation");
      break;
    }
  }
  return Object.freeze(warnings);
}
