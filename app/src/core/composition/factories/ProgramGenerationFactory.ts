import type { ExerciseSelectionService } from "../../../features/exercise-selection/services/ExerciseSelectionService";
import {
  ProgramGenerationOrchestrator,
  type ProgramGenerationDependencies,
} from "../../../features/program-generation/orchestrator/ProgramGenerationOrchestrator";
import { ProgramGenerationService } from "../../../features/program-generation/services/ProgramGenerationService";
import type { ProgrammingService } from "../../../features/programming/services/ProgrammingService";
import type { ProgressionService } from "../../../features/progression/services/ProgressionService";
import type { TrainingAdaptationService } from "../../../features/training-adaptation/services/TrainingAdaptationService";
import type { WorkoutAssemblyService } from "../../../features/workout-assembly/services/WorkoutAssemblyService";
import type { WorkoutBlueprintService } from "../../../features/workout-blueprint/services/WorkoutBlueprintService";

export interface ProgramGenerationFactoryDeps {
  readonly blueprintService: WorkoutBlueprintService;
  readonly selectionService: ExerciseSelectionService;
  readonly programmingService: ProgrammingService;
  readonly progressionService: ProgressionService;
  readonly adaptationService: TrainingAdaptationService;
  readonly assemblyService: WorkoutAssemblyService;
}

/**
 * Factory — object creation only for ProgramGenerationService + orchestrator.
 */
export const ProgramGenerationFactory = {
  create(deps: ProgramGenerationFactoryDeps): ProgramGenerationService {
    const orchestratorDeps: ProgramGenerationDependencies = {
      blueprintService: deps.blueprintService,
      selectionService: deps.selectionService,
      programmingService: deps.programmingService,
      progressionService: deps.progressionService,
      adaptationService: deps.adaptationService,
      assemblyService: deps.assemblyService,
    };
    const orchestrator = new ProgramGenerationOrchestrator(orchestratorDeps);
    return new ProgramGenerationService(orchestrator);
  },
} as const;
