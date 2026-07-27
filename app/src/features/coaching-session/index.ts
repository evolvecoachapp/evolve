/**
 * Coaching Session Runtime + Explainable Coaching Session Composition
 *
 * Sprint 22.0 — Coaching Session Runtime (lifecycle).
 * Sprint 26.1 — Explainable Coaching Session composition.
 *
 * User
 *   ↓
 * Conversation Runtime
 *   ↓
 * Coaching Session Runtime (lifecycle)
 *   ↓
 * Coach Supervisor / domain engines
 *   ↓
 * Explainable Coaching Session (composition)
 *   ↓
 * Conversation Response
 *
 * Lifecycle owns session start/continue/end.
 * Composition owns evidence packaging for every coaching turn.
 * Does NOT replace Timeline / Decision / Recommendation / Explainability / Insights.
 *
 * No AI. No prompts. No networking. No persistence. No UI.
 */

export * from "./models";
export {
  startSession,
  continueSession,
  endSession,
  describeSession,
  validateSession,
} from "./application";
export {
  CoachingSessionService,
  createCoachingSessionService,
} from "./services";

// Sprint 26.1 — Explainable Coaching Session composition
// (CoachingSession artifact type is exported from composition path to avoid
// clashing with Sprint 22.0 runtime descriptor `CoachingSession`.)
export type {
  CoachingSessionContext,
  CoachingSessionEvidence,
  CoachingSessionEvidenceItem,
  CoachingSessionEvidenceSource,
  CoachingSessionDecision,
  CoachingSessionRecommendation,
  CoachingSessionInsight,
  CoachingSessionExplanation,
  CoachingSessionSummary,
  CoachingSessionConfidence,
  CoachingSessionConfidenceLevel,
  CoachingSessionResult as ExplainableCoachingSessionResult,
  CoachingSessionValidation as ExplainableCoachingSessionValidation,
} from "./composition/models";
export type { CoachingSession as ExplainableCoachingSession } from "./composition/models/CoachingSession";
export {
  CoachingSessionConfidenceLevels,
  EMPTY_COACHING_SESSION_CONFIDENCE,
} from "./composition/models";
export {
  collectEvidence,
  collectTimelineContext,
  collectDecisionContext,
  collectRecommendationContext,
  collectInsightContext,
  collectExplanationContext,
  buildSessionSummary,
  calculateSessionConfidence,
  validateCoachingSession as validateExplainableSessionModel,
  buildCoachingSession,
  ExplainableCoachingSessionService,
  createExplainableCoachingSessionService,
} from "./composition/services";
export {
  composeCoachingSession,
  getLatestCoachingSession,
  getCoachingSessionSummary,
  getCoachingSessionEvidence,
  getCoachingSessionInsights,
  getCoachingSessionConfidence,
  validateExplainableCoachingSession,
} from "./composition/application";
