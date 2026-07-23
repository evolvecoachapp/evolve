/**
 * Workout Agent
 *
 * Specialized framework agent for workout domain orchestration.
 *
 * Agent Runtime → Workout Framework Agent → Planning → Workout Domain → Workout Result
 *
 * Orchestrates existing components. Does not generate prompts, call providers,
 * or execute tools. No networking. No persistence. No UI. No business logic.
 */

export * from "./models";
export {
  processWorkoutRequest,
  buildWorkoutPlan,
  adaptWorkout,
  evaluateWorkout,
  describeWorkoutCapabilities,
  validateWorkoutPlan,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export {
  WorkoutFrameworkAgent,
  createWorkoutFrameworkAgent,
  WORKOUT_FRAMEWORK_CAPABILITY_KEYS,
} from "./framework";
export {
  WorkoutDomainGateway,
  createWorkoutDomainGateway,
} from "./orchestrator/WorkoutDomainGateway";
