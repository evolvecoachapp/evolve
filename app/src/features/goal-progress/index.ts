/**
 * Goal Progress Engine
 *
 * Sprint 24.4 — Goal Progress Engine Foundation.
 *
 * Athlete State Engine
 *   + Workout / Nutrition / Recovery Adaptation Engines
 *   + Decision History + Recommendation History
 *   ↓
 * Goal Progress Engine
 *   ↓
 * GoalProgressState / GoalPackage
 *   ↓
 * ContinuousAdaptationInput → Continuous Adaptation Engine
 *
 * Goal progress evaluation only.
 * Does NOT adapt workout / nutrition / recovery plans.
 * Does NOT mutate goals. Does NOT perform AI reasoning.
 *
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 * No persistence. No networking. No UI.
 *
 * Public surface: models + application API + GoalProgressEngineService.
 */

export * from "./models";
export {
  evaluateGoalProgress,
  trackGoalProgress,
  describeGoalProgress,
  createGoalSnapshot,
  validateGoalProgress,
} from "./application";
export {
  GoalProgressEngineService,
  createGoalProgressEngineService,
} from "./services";
