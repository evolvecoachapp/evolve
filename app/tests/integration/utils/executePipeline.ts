import {
  createTestProgramGenerationService,
} from "../../../src/features/program-generation/testSupport/fixtures";
import type { ProgramGenerationService } from "../../../src/features/program-generation/services";
import type { WorkoutGenerationRequest } from "../../../src/features/program-generation/models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../../../src/features/program-generation/models/WorkoutGenerationResult";

let sharedService: ProgramGenerationService | null = null;

/**
 * Isolated ProgramGenerationService wired with in-memory engines + selection catalog.
 * Reuses the program-generation testSupport factory — no production wiring.
 */
export function createIntegrationPipelineService(): ProgramGenerationService {
  return createTestProgramGenerationService();
}

/**
 * Shared service instance for a single test file (reset between suites as needed).
 */
export function getSharedIntegrationPipelineService(): ProgramGenerationService {
  if (!sharedService) {
    sharedService = createIntegrationPipelineService();
  }
  return sharedService;
}

export function resetSharedIntegrationPipelineService(): void {
  sharedService = null;
}

/**
 * Execute the complete workout generation pipeline for a request.
 */
export async function executePipeline(
  request: WorkoutGenerationRequest,
  service: ProgramGenerationService = createIntegrationPipelineService(),
): Promise<WorkoutGenerationResult> {
  return service.generateWorkoutProgram(request);
}

/**
 * Preview path (same engines, orchestration-only).
 */
export async function previewPipeline(
  request: WorkoutGenerationRequest,
  service: ProgramGenerationService = createIntegrationPipelineService(),
): Promise<WorkoutGenerationResult> {
  return service.previewWorkoutProgram(request);
}
