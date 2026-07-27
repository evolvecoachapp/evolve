/**
 * Explainable Coaching Session composition (Sprint 26.1).
 *
 * Composes existing Timeline / Decision / Recommendation / Explainability /
 * Proactive Insights / Plan History / Conversation evidence into one
 * immutable CoachingSession artifact.
 *
 * Distinct from Sprint 22.0 Coaching Session Runtime lifecycle.
 * No new engines. No LLM reasoning. No persistence. No event bus.
 */

export * from "./models";
export * from "./services";
export {
  composeCoachingSession,
  getLatestCoachingSession,
  getCoachingSessionSummary,
  getCoachingSessionEvidence,
  getCoachingSessionInsights,
  getCoachingSessionConfidence,
  validateExplainableCoachingSession,
} from "./application";
