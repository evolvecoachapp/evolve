import type { CoachResponse } from "../models/CoachResponse";
import type { CoachSummary } from "../models/CoachSummary";
import { freezeSummary } from "./freezeObjects";
import { previewText } from "./formattingHelpers";
import { computeResponseMetrics } from "./responseMetrics";

/**
 * Build a compact immutable summary from a CoachResponse.
 */
export function summarizeCoachResponse(response: CoachResponse): CoachSummary {
  const metrics = computeResponseMetrics(response);
  return freezeSummary({
    responseId: response.id,
    intent: response.intent,
    messagePreview: previewText(response.message.text),
    recommendationCount: response.recommendations.length,
    warningCount: response.warnings.length,
    actionCount: response.actions.length,
    insightCount: response.insights.length,
    questionCount: response.questions.length,
    citationCount: response.citations.length,
    confidenceScore: response.confidence.score,
    complete: metrics.completenessRatio >= 0.5,
  });
}
