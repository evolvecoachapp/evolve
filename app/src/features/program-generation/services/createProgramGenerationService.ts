import { createWorkoutBlueprintService } from "../../workout-blueprint/services";
import type { WorkoutBlueprintService } from "../../workout-blueprint/services/WorkoutBlueprintService";
import { createExerciseSelectionService } from "../../exercise-selection/services";
import type { ExerciseSelectionService } from "../../exercise-selection/services/ExerciseSelectionService";
import { createProgrammingService } from "../../programming/services";
import type { ProgrammingService } from "../../programming/services/ProgrammingService";
import { createProgressionService } from "../../progression/services";
import type { ProgressionService } from "../../progression/services/ProgressionService";
import { createTrainingAdaptationService } from "../../training-adaptation/services";
import type { TrainingAdaptationService } from "../../training-adaptation/services/TrainingAdaptationService";
import { createWorkoutAssemblyService } from "../../workout-assembly/services";
import type { WorkoutAssemblyService } from "../../workout-assembly/services/WorkoutAssemblyService";
import {
  ProgramGenerationOrchestrator,
  type ProgramGenerationDependencies,
} from "../orchestrator/ProgramGenerationOrchestrator";
import { ProgramGenerationService } from "./ProgramGenerationService";

export interface CreateProgramGenerationServiceOptions {
  readonly blueprintService?: WorkoutBlueprintService;
  readonly selectionService?: ExerciseSelectionService;
  readonly programmingService?: ProgrammingService;
  readonly progressionService?: ProgressionService;
  readonly adaptationService?: TrainingAdaptationService;
  readonly assemblyService?: WorkoutAssemblyService;
}

/**
 * Compose ProgramGenerationService with default in-memory engine services.
 */
export function createProgramGenerationService(
  options: CreateProgramGenerationServiceOptions = {},
): ProgramGenerationService {
  const deps: ProgramGenerationDependencies = {
    blueprintService:
      options.blueprintService ?? createWorkoutBlueprintService(),
    selectionService:
      options.selectionService ?? createExerciseSelectionService(),
    programmingService:
      options.programmingService ?? createProgrammingService(),
    progressionService:
      options.progressionService ?? createProgressionService(),
    adaptationService:
      options.adaptationService ?? createTrainingAdaptationService(),
    assemblyService: options.assemblyService ?? createWorkoutAssemblyService(),
  };

  const orchestrator = new ProgramGenerationOrchestrator(deps);
  return new ProgramGenerationService(orchestrator);
}

export function createEmptyProgramGenerationService(): ProgramGenerationService {
  return createProgramGenerationService();
}
