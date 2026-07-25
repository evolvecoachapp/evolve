import type { CoachingDecision } from "../models/CoachingDecision";
import { freezeDecision } from "../utils/FreezeDecisionState";

/**
 * Merge resolver — deterministic de-dupe by category+intent (keep higher score).
 */
export function resolveMerge(
  decisions: readonly CoachingDecision[],
): readonly CoachingDecision[] {
  const best = new Map<string, CoachingDecision>();
  for (const decision of decisions) {
    const key = `${decision.category}:${decision.intent}`;
    const existing = best.get(key);
    if (!existing || decision.score.total > existing.score.total) {
      best.set(key, decision);
    }
  }
  return Object.freeze([...best.values()].map(freezeDecision));
}
