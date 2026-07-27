/**
 * Workout Generation Pipeline — product orchestration (Sprint 24.1 + 24.3).
 *
 * Generation:
 * Conversation → Coaching Session → Coach Supervisor → Workout Agent
 * → Athlete State → Context Fusion → Decision → Recommendation
 * → Workout Generation → WorkoutPlan
 *
 * Adaptive modification (living WorkoutPlan):
 * WorkoutPlan → Modification Request → Workout Agent → Validation → Updated WorkoutPlan
 *
 * Orchestration only. Reuses existing engines. No new engines.
 */

export * from "./models";
export * from "./builders";
export * from "./validators";
export * from "./adapters";
export * from "./modification";
export {
  generateWorkoutPlan,
  modifyWorkoutPlan,
  validateGeneratedWorkoutPlan,
  validateAdaptedWorkoutPlan,
} from "./application";
export {
  createWorkoutGenerationPipelineService,
  WorkoutGenerationPipelineService,
  type WorkoutGenerationPipelineServiceDeps,
} from "./services";
export {
  WorkoutGenerationPipelineOrchestrator,
  createWorkoutGenerationPipelineOrchestrator,
  type WorkoutGenerationPipelineDeps,
} from "./orchestrator/WorkoutGenerationPipelineOrchestrator";
