/**
 * Continuous Adaptation Engine
 *
 * Sprint 23.1 — Continuous Adaptation Engine Foundation.
 *
 * Athlete State + Context Fusion + Decision + Recommendation + Explainability
 *   ↓
 * Continuous Adaptation Engine
 *   ↓
 * AdaptationDecision
 *   ↓
 * WorkoutAdaptationInput / NutritionAdaptationInput /
 * RecoveryAdaptationInput / GoalProgressInput
 *
 * Adaptation detection only. Does NOT modify plans.
 *
 * No AI. No heuristics. No prediction. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 * No recommendation generation. No business calculations.
 */

export * from "./models";
export {
  evaluateAdaptation,
  detectAdaptation,
  describeAdaptation,
  createAdaptationSnapshot,
  validateAdaptation,
} from "./application";
export {
  ContinuousAdaptationEngineService,
  createContinuousAdaptationEngineService,
} from "./services";
