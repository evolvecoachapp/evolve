import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { AthleteContext } from "../models/coach/AthleteContext";

/** Build athlete readiness context from a coach summary. */
export function buildAthleteContext(summary: CoachSummary): AthleteContext {
  return Object.freeze({
    recovery: summary.recovery,
    consistencyScore: summary.consistencyScore,
  });
}
