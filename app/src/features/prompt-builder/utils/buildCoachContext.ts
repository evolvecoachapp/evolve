import type { CoachInsight } from "../../coach-intelligence/models/CoachInsight";
import type { CoachRecommendation } from "../../coach-intelligence/models/CoachRecommendation";
import type { RiskFlag } from "../../coach-intelligence/models/RiskFlag";
import type { CoachContext } from "../models/CoachContext";

export interface BuildCoachContextInput {
  readonly riskFlags: readonly RiskFlag[];
  readonly recommendations: readonly CoachRecommendation[];
  readonly insights: readonly CoachInsight[];
}

/** Build coach risk/recommendation/insight context. */
export function buildCoachContext(
  input: BuildCoachContextInput,
): CoachContext {
  return Object.freeze({
    riskFlags: Object.freeze([...input.riskFlags]),
    recommendations: Object.freeze([...input.recommendations]),
    insights: Object.freeze([...input.insights]),
  });
}
