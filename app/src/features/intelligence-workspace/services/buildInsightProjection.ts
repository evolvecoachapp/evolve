import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { WorkspaceInsights } from "../models/WorkspaceInsights";

export interface BuildInsightProjectionInput {
  readonly athleteId: string;
  readonly insights?: readonly CoachInsight[];
  readonly criticalFindings?: readonly CoachInsight[];
}

/**
 * Builds the insight projection from existing proactive insights only.
 */
export function buildInsightProjection(
  input: BuildInsightProjectionInput,
): WorkspaceInsights {
  const insights = input.insights ?? Object.freeze([]);
  const criticalFindings = input.criticalFindings ?? Object.freeze([]);
  const currentPatterns = Object.freeze(insights.map((item) => item.title).slice(0, 5));

  return Object.freeze({
    athleteId: input.athleteId,
    present: insights.length > 0,
    insights,
    currentPatterns,
    criticalFindings,
    summary:
      insights[0]?.summary ??
      "No proactive insight patterns are currently available.",
  });
}
