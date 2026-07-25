/**
 * Recommendation Engine
 *
 * Sprint 22.4 — Recommendation Engine Foundation.
 *
 * UnifiedCoachingContext
 *   ↓
 * Decision Engine
 *   ↓
 * CoachingDecision
 *   ↓
 * Recommendation Engine
 *   ↓
 * CoachingRecommendation
 *   ↓
 * Explainability Engine
 *   ↓
 * Coach Supervisor
 *
 * Deterministic recommendation orchestration only.
 * Owns planning + prioritization + packaging of coaching recommendations.
 *
 * No AI. No NL. No domain calculations. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 */

export * from "./models";
export {
  buildRecommendations,
  prioritizeRecommendations,
  packageRecommendations,
  describeRecommendations,
  validateRecommendations,
} from "./application";
export {
  RecommendationEngineService,
  createRecommendationEngineService,
} from "./services";
