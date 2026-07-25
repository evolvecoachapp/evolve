import type { CoachingDecision } from "../models/CoachingDecision";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

export function selectHighestPriority(
  decisions: readonly CoachingDecision[],
): CoachingDecision | null {
  return sortDecisionsByPriority(decisions)[0] ?? null;
}
