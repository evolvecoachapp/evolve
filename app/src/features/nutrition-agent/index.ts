/**
 * Nutrition Agent
 *
 * Sprint 21.2 — Nutrition Agent Foundation.
 *
 * Agent Runtime → Nutrition Framework Agent → Nutrition Domain Gateway →
 * Domain Capability Selector → Nutrition Domain → NutritionAgentResult
 *
 * Orchestrates existing Nutrition Domain contracts. Does not generate prompts,
 * call providers, or execute tools. No networking. No persistence. No UI.
 * No business logic.
 */

export * from "./models";
export {
  processNutritionRequest,
  buildNutritionPlan,
  adjustNutritionPlan,
  evaluateNutrition,
  describeNutritionCapabilities,
  validateNutritionPlan,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export {
  NutritionFrameworkAgent,
  createNutritionFrameworkAgent,
  NUTRITION_FRAMEWORK_CAPABILITY_KEYS,
} from "./framework";
