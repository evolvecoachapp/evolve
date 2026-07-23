import type { CoachInsight } from "../../../coach-intelligence/models/CoachInsight";
import type { CoachRecommendation } from "../../../coach-intelligence/models/CoachRecommendation";
import type { RiskFlag } from "../../../coach-intelligence/models/RiskFlag";

/**
 * Coach intelligence risks, recommendations, and insights for the prompt.
 *
 * Structured evidence only — never natural language.
 */
export interface CoachContext {
  readonly riskFlags: readonly RiskFlag[];
  readonly recommendations: readonly CoachRecommendation[];
  readonly insights: readonly CoachInsight[];
}
