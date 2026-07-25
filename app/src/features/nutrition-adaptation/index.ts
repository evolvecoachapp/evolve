/**
 * Nutrition Adaptation Engine
 *
 * Sprint 24.2 — Nutrition Adaptation Engine Foundation.
 *
 * Nutrition Plan + Nutrition Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   ↓
 * Nutrition Adaptation Engine
 *   ↓
 * Updated Nutrition Plan → Nutrition Runtime
 *
 * Adapts an existing nutrition plan according to adaptation decisions.
 * Does NOT generate nutrition from scratch. Does NOT change athlete goals.
 *
 * No AI. No heuristics. No prediction. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 * No business calculations that invent prescriptions.
 *
 * Public surface: models + application API + NutritionAdaptationEngineService.
 * Internal layers (evaluation / planning / adapters / policies / etc.) are not exported.
 */

export * from "./models";
export {
  adaptNutrition,
  compareNutrition,
  describeNutritionAdaptation,
  createNutritionSnapshot,
  validateNutritionAdaptation,
} from "./application";
export {
  NutritionAdaptationEngineService,
  createNutritionAdaptationEngineService,
} from "./services";
