import type { ExerciseSelectionService } from "../../../features/exercise-selection/services/ExerciseSelectionService";
import type { ProgramGenerationService } from "../../../features/program-generation/services/ProgramGenerationService";
import type { ProgrammingService } from "../../../features/programming/services/ProgrammingService";
import type { ProgressionService } from "../../../features/progression/services/ProgressionService";
import type { TrainingAdaptationService } from "../../../features/training-adaptation/services/TrainingAdaptationService";
import type { WorkoutAssemblyService } from "../../../features/workout-assembly/services/WorkoutAssemblyService";
import type { WorkoutBlueprintService } from "../../../features/workout-blueprint/services/WorkoutBlueprintService";

/**
 * Strongly typed map of Composition Root services.
 * Extend this interface when registering future services.
 */
export interface ServiceMap {
  ProgramGenerationService: ProgramGenerationService;
  WorkoutBlueprintService: WorkoutBlueprintService;
  ExerciseSelectionService: ExerciseSelectionService;
  ProgrammingService: ProgrammingService;
  ProgressionService: ProgressionService;
  TrainingAdaptationService: TrainingAdaptationService;
  WorkoutAssemblyService: WorkoutAssemblyService;
}

export type ServiceToken = keyof ServiceMap;

/** Canonical ordered tokens for registry integrity checks. */
export const SERVICE_TOKENS = [
  "WorkoutBlueprintService",
  "ExerciseSelectionService",
  "ProgrammingService",
  "ProgressionService",
  "TrainingAdaptationService",
  "WorkoutAssemblyService",
  "ProgramGenerationService",
] as const satisfies readonly ServiceToken[];
