import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionOutcome } from "../models/DecisionOutcome";

export function selectByOutcome(
  decisions: readonly CoachingDecision[],
  outcome: DecisionOutcome,
): readonly CoachingDecision[] {
  return Object.freeze(decisions.filter((d) => d.outcome === outcome));
}
