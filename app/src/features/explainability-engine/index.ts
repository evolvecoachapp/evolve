/**
 * Explainability Engine
 *
 * Sprint 22.5 — Explainability Engine.
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
 * CoachingExplanation
 *   ↓
 * Coach Supervisor
 *   ↓
 * LLM Response Formatter
 *
 * Deterministic explanation orchestration only.
 * Explains WHY a recommendation exists. NEVER changes decisions.
 *
 * No AI. No NL. No domain calculations. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 */

export * from "./models";
export {
  buildExplanation,
  validateExplanation,
  describeExplanation,
  createExplanationSnapshot,
  packageExplanation,
} from "./application";
export {
  ExplainabilityEngineService,
  createExplainabilityEngineService,
} from "./services";
