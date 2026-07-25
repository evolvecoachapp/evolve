import type { CoachingDecision } from "../models/CoachingDecision";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

/**
 * Priority planner — stable ordinal ordering only.
 */
export function planByPriority(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  return sortDecisionsByPriority(decisions);
}
