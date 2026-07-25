import type { CoachingDecision } from "../models/CoachingDecision";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

/**
 * Priority resolver — stable sort by ordinal.
 */
export function resolvePriorities(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  return sortDecisionsByPriority(decisions);
}
