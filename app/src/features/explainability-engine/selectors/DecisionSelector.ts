import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";

export function selectDecisionById(
  decisions: readonly CoachingDecision[],
  id: string,
): CoachingDecision | null {
  return decisions.find((d) => d.id === id) ?? null;
}
