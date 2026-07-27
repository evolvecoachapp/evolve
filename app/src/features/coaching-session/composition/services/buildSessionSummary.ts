import type { CoachConversationIntent } from "../../../coach-conversation/models/CoachConversationIntent";
import type { CoachingSessionConfidence } from "../models/CoachingSessionConfidence";
import type { CoachingSessionDecision } from "../models/CoachingSessionDecision";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";
import type { CoachingSessionExplanation } from "../models/CoachingSessionExplanation";
import type { CoachingSessionInsight } from "../models/CoachingSessionInsight";
import type { CoachingSessionRecommendation } from "../models/CoachingSessionRecommendation";
import type { CoachingSessionSummary } from "../models/CoachingSessionSummary";

/**
 * Build a deterministic session summary from composed fragments only.
 */
export function buildSessionSummary(input: {
  readonly sessionId: string;
  readonly intent: CoachConversationIntent;
  readonly evidence: CoachingSessionEvidence;
  readonly decision: CoachingSessionDecision;
  readonly recommendation: CoachingSessionRecommendation;
  readonly insight: CoachingSessionInsight;
  readonly explanation: CoachingSessionExplanation;
  readonly confidence: CoachingSessionConfidence;
  readonly expectedOutcome: string;
  readonly generatedAt: string;
}): CoachingSessionSummary {
  const highlights: string[] = [];
  if (input.evidence.items.length > 0) {
    highlights.push(`Evidence items: ${input.evidence.items.length}`);
  }
  if (input.decision.present) {
    highlights.push(input.decision.summary);
  }
  if (input.recommendation.present) {
    highlights.push(input.recommendation.summary);
  }
  if (input.insight.present) {
    highlights.push(input.insight.summary);
  }
  if (input.explanation.present) {
    highlights.push(input.explanation.summary);
  }
  highlights.push(`Confidence: ${input.confidence.level} (${input.confidence.score})`);

  const headline = `Explainable coaching session for intent ${input.intent}`;
  const narrative = [
    `Session ${input.sessionId} assembled from existing domain evidence.`,
    input.evidence.summary,
    `Expected outcome: ${input.expectedOutcome}`,
    input.confidence.rationale,
  ].join(" ");

  return Object.freeze({
    id: `summary:${input.sessionId}`,
    headline,
    narrative,
    highlights: Object.freeze(highlights),
    generatedAt: input.generatedAt,
  });
}
