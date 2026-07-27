import type { InsightAnalysisResult } from "../models/InsightAnalysisResult";
import type { ProactiveInsightsService } from "../services/ProactiveInsightsService";

/**
 * Detect conversation messages that should be answered from proactive insights.
 */
export function isCoachInsightMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  return (
    /\banything i should know\b/i.test(trimmed) ||
    /\bdo you see any (problems?|issues?|risks?)\b/i.test(trimmed) ||
    /\bhow am i progressing\b/i.test(trimmed) ||
    /\bwhat should i improve\b/i.test(trimmed) ||
    /\bwhat patterns? do you notice\b/i.test(trimmed) ||
    /\b(proactive |coach )?insights?\b/i.test(trimmed) ||
    /\bany (warnings?|red flags?|concerns?)\b/i.test(trimmed) ||
    /\bwhat('?s| is) (going )?(wrong|at risk)\b/i.test(trimmed)
  );
}

/**
 * Build a deterministic coaching reply strictly from generated insights.
 * Never fabricates observations.
 */
export function buildInsightGroundedReply(input: {
  readonly insights: ProactiveInsightsService;
  readonly athleteId: string;
  readonly message: string;
}): { readonly message: string; readonly result: InsightAnalysisResult } {
  const lower = input.message.toLowerCase();
  let result: InsightAnalysisResult;

  if (/progress|goal|accelerat|plateau|stall/.test(lower)) {
    const goalInsights = input.insights.getGoalInsights(input.athleteId);
    result = Object.freeze({
      query: null,
      insights: goalInsights,
      snapshot: null,
      summary: null,
      matchedCount: goalInsights.length,
      success: true,
      message:
        goalInsights.length > 0
          ? `Matched ${goalInsights.length} goal insight(s).`
          : "No goal insights matched available evidence.",
      generatedAt: input.insights.now(),
    });
  } else if (/recover|fatigue|overreach|readiness/.test(lower)) {
    const recoveryInsights = input.insights.getRecoveryInsights(
      input.athleteId,
    );
    result = Object.freeze({
      query: null,
      insights: recoveryInsights,
      snapshot: null,
      summary: null,
      matchedCount: recoveryInsights.length,
      success: true,
      message:
        recoveryInsights.length > 0
          ? `Matched ${recoveryInsights.length} recovery insight(s).`
          : "No recovery insights matched available evidence.",
      generatedAt: input.insights.now(),
    });
  } else if (/problem|issue|risk|wrong|warning|critical|concern/.test(lower)) {
    const critical = input.insights.getCriticalInsights(input.athleteId);
    result = Object.freeze({
      query: null,
      insights: critical,
      snapshot: null,
      summary: null,
      matchedCount: critical.length,
      success: true,
      message:
        critical.length > 0
          ? `Matched ${critical.length} critical insight(s).`
          : "No critical insights matched available evidence.",
      generatedAt: input.insights.now(),
    });
  } else {
    result = input.insights.analyze({ athleteId: input.athleteId });
  }

  if (result.insights.length === 0) {
    return {
      message:
        "I have no proactive coach insights supported by current evidence, so I will not invent observations.",
      result,
    };
  }

  const body = result.insights
    .slice(0, 5)
    .map((insight) => {
      return [
        `${insight.severity} — ${insight.title}`,
        `Evidence: ${insight.evidence.summary}`,
        `Reason: ${insight.reason.reason}`,
        `Recommendation: ${insight.recommendation.action}`,
        `Expected outcome: ${insight.expectedOutcome}`,
        `Confidence: ${insight.confidence}`,
      ].join(". ");
    })
    .join(" ");

  return {
    message: `From proactive coach insights: ${body}`.trim(),
    result,
  };
}
