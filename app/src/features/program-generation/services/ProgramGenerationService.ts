import type { ExecutionReport } from "../../../core/decision-intelligence";
import type { ProgramGenerationOrchestrator } from "../orchestrator/ProgramGenerationOrchestrator";
import type { WorkoutGenerationExplanation } from "../models/WorkoutGenerationExplanation";
import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";

/**
 * Thin service wrapper over the Program Generation Orchestrator.
 *
 * No caching. No persistence. No business logic.
 */
export class ProgramGenerationService {
  constructor(private readonly orchestrator: ProgramGenerationOrchestrator) {}

  async generateWorkoutProgram(
    request: WorkoutGenerationRequest,
  ): Promise<WorkoutGenerationResult> {
    return this.orchestrator.generate(request);
  }

  async previewWorkoutProgram(
    request: WorkoutGenerationRequest,
  ): Promise<WorkoutGenerationResult> {
    return this.orchestrator.preview(request);
  }

  async explainWorkoutGeneration(
    result: WorkoutGenerationResult,
  ): Promise<readonly WorkoutGenerationExplanation[]> {
    return this.orchestrator.explain(result);
  }

  /**
   * Decision Intelligence report from an in-hand generation result.
   */
  buildDecisionIntelligence(
    result: WorkoutGenerationResult,
  ): ExecutionReport {
    return this.orchestrator.buildDecisionIntelligence(result);
  }
}
