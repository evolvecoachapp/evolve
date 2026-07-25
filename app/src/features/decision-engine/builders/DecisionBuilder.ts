import type { CoachingDecision } from "../models/CoachingDecision";
import { freezeDecision } from "../utils/FreezeDecisionState";

export function buildCoachingDecision(
  decision: CoachingDecision,
): CoachingDecision {
  return freezeDecision(decision);
}
