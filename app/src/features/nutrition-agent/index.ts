/**
 * Nutrition Agent
 *
 * Sprint 21.2 — Nutrition Agent Foundation.
 *
 * User Request → Conversation Runtime → Nutrition Agent → Coach Intelligence
 *   → Prompt Builder → AI Provider → Response Formatter → Action Engine
 *   → Tool Runtime → Nutrition Domain
 *
 * Orchestrates existing components. Does not generate prompts, call providers,
 * or execute tools. No networking. No persistence. No UI.
 */

export * from "./models";
export {
  processNutritionRequest,
  buildNutritionPlan,
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
