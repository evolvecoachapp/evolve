import type { WorkoutPipelineRequest } from "../models/WorkoutPipelineRequest";
import type { WorkoutResult } from "../models/WorkoutResult";
import {
  createWorkoutGenerationPipelineOrchestrator,
  type WorkoutGenerationPipelineDeps,
  type WorkoutGenerationPipelineOrchestrator,
} from "../orchestrator/WorkoutGenerationPipelineOrchestrator";

export type WorkoutGenerationPipelineServiceDeps = WorkoutGenerationPipelineDeps;

/**
 * Service facade for the Workout Generation Pipeline.
 * Orchestration only — no engine business logic.
 */
export class WorkoutGenerationPipelineService {
  private readonly orchestrator: WorkoutGenerationPipelineOrchestrator;

  constructor(deps: WorkoutGenerationPipelineServiceDeps) {
    this.orchestrator = createWorkoutGenerationPipelineOrchestrator(deps);
  }

  generateWorkoutPlan(request: WorkoutPipelineRequest): Promise<WorkoutResult> {
    return this.orchestrator.generate(request);
  }
}

export function createWorkoutGenerationPipelineService(
  deps: WorkoutGenerationPipelineServiceDeps,
): WorkoutGenerationPipelineService {
  return new WorkoutGenerationPipelineService(deps);
}
