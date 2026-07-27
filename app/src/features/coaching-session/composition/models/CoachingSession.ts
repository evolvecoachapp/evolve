import type { CoachConversationIntent } from "../../../coach-conversation/models/CoachConversationIntent";
import type { CoachingSessionConfidence } from "./CoachingSessionConfidence";
import type { CoachingSessionContext } from "./CoachingSessionContext";
import type { CoachingSessionDecision } from "./CoachingSessionDecision";
import type { CoachingSessionEvidence } from "./CoachingSessionEvidence";
import type { CoachingSessionExplanation } from "./CoachingSessionExplanation";
import type { CoachingSessionInsight } from "./CoachingSessionInsight";
import type { CoachingSessionRecommendation } from "./CoachingSessionRecommendation";
import type { CoachingSessionSummary } from "./CoachingSessionSummary";

/**
 * Immutable Explainable Coaching Session (Sprint 26.1).
 *
 * Composes existing Timeline / Decision / Recommendation / Explainability /
 * Insights / Plan / Conversation evidence into one structured session artifact.
 *
 * Distinct from Sprint 22.0 Coaching Session Runtime descriptor (`models/CoachingSession`).
 * Never mutate after creation. Never invent evidence.
 */
export interface CoachingSession {
  readonly id: string;
  readonly timestamp: string;
  readonly userRequest: string;
  readonly conversationIntent: CoachConversationIntent;
  readonly evidenceUsed: CoachingSessionEvidence;
  readonly timelineReferences: readonly string[];
  readonly decisionSummary: CoachingSessionDecision;
  readonly recommendationSummary: CoachingSessionRecommendation;
  readonly insightSummary: CoachingSessionInsight;
  readonly reasoningSummary: CoachingSessionExplanation;
  readonly expectedOutcome: string;
  readonly confidence: CoachingSessionConfidence;
  readonly relatedDomains: readonly string[];
  readonly context: CoachingSessionContext;
  readonly summary: CoachingSessionSummary;
  readonly metadata: Readonly<Record<string, string>>;
}
