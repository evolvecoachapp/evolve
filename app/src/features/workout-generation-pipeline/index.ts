/**
 * Workout Generation Pipeline — product orchestration (Sprint 24.1 product capability).
 *
 * Conversation → Coaching Session → Coach Supervisor → Workout Agent
 * → Athlete State → Context Fusion → Decision → Recommendation
 * → Workout Generation → WorkoutPlan
 *
 * Orchestration only. Reuses existing engines. No new engines.
 */

export * from "./models";
export * from "./builders";
export * from "./validators";
export * from "./adapters";
export {
  generateWorkoutPlan,
  validateGeneratedWorkoutPlan,
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
