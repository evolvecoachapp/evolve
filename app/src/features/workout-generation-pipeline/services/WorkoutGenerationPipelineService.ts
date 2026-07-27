import type { WorkoutModificationRequest } from "../models/WorkoutModificationRequest";
import type { WorkoutModificationResult } from "../models/WorkoutModificationResult";
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

  /**
   * Adaptive modification of an existing WorkoutPlan (no full regeneration).
   */
  modifyWorkoutPlan(
    request: WorkoutModificationRequest,
  ): WorkoutModificationResult {
    return this.orchestrator.modify(request);
  }
}

export function createWorkoutGenerationPipelineService(
  deps: WorkoutGenerationPipelineServiceDeps,
): WorkoutGenerationPipelineService {
  return new WorkoutGenerationPipelineService(deps);
}
