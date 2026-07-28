import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { WorkspaceInsights } from "../models/WorkspaceInsights";

export interface BuildWorkspaceInsightsInput {
  readonly athleteId: string;
  readonly insights?: readonly CoachInsight[];
  readonly criticalFindings?: readonly CoachInsight[];
  readonly homeExperience?: HomeExperience | null;
}

/**
 * Builds insights projection from Proactive Insights and Home insight cards.
 */
export function buildWorkspaceInsights(
  input: BuildWorkspaceInsightsInput,
): WorkspaceInsights {
  const insights = input.insights ?? Object.freeze([]);
  const criticalFindings = input.criticalFindings ?? Object.freeze([]);
  const homeInsightCards =
    input.homeExperience?.insights ?? Object.freeze([]);
  const currentPatterns = Object.freeze(
    insights.map((item) => item.title).slice(0, 5),
  );
  const present = insights.length > 0 || homeInsightCards.length > 0;

  return Object.freeze({
    athleteId: input.athleteId,
    present,
    insights,
    homeInsightCards,
    currentPatterns,
    criticalFindings,
    summary:
      insights[0]?.summary ??
      homeInsightCards[0]?.summary ??
      "No proactive insight patterns are currently available.",
  });
}
