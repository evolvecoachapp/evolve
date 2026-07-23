/**
 * Workout Agent
 *
 * Sprint 21.0 — Workout Agent Foundation.
 *
 * User Request → Conversation Runtime → Workout Agent → Coach Intelligence
 *   → Prompt Builder → AI Provider → Response Formatter → Action Engine
 *   → Tool Runtime → Workout Domain
 *
 * Orchestrates existing components. Does not generate prompts, call providers,
 * or execute tools. No networking. No persistence. No UI.
 */

export * from "./models";
export {
  processWorkoutRequest,
  buildWorkoutPlan,
  evaluateWorkout,
  describeWorkoutCapabilities,
  validateWorkoutPlan,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
