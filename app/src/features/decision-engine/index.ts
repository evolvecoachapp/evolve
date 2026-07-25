/**
 * Decision Engine
 *
 * Sprint 22.3 — Decision Engine Foundation.
 *
 * UnifiedCoachingContext
 *   ↓
 * Decision Engine
 *   ↓
 * CoachingDecision
 *   ↓
 * Recommendation Engine
 *   ↓
 * Coach Supervisor
 *
 * Deterministic orchestration-level reasoning only.
 * Owns analysis + evaluation + planning + resolution of coaching decisions.
 *
 * No AI. No NL. No domain calculations. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 */

export * from "./models";
export {
  buildDecision,
  evaluateDecision,
  resolveDecision,
  describeDecision,
  validateDecision,
} from "./application";
export {
  DecisionEngineService,
  createDecisionEngineService,
} from "./services";
