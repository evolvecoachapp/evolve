import {
  InMemorySelectionRepository,
  type SelectionRepository,
  selectionRepository,
} from "../../../features/exercise-selection/repository";
import {
  InMemoryProgrammingRepository,
  type ProgrammingRepository,
  programmingRepository,
} from "../../../features/programming/repository";
import {
  InMemoryProgressionRepository,
  type ProgressionRepository,
  progressionRepository,
} from "../../../features/progression/repository";
import {
  InMemoryTrainingAdaptationRepository,
  type TrainingAdaptationRepository,
  trainingAdaptationRepository,
} from "../../../features/training-adaptation/repository";
import {
  InMemoryWorkoutAssemblyRepository,
  type WorkoutAssemblyRepository,
  workoutAssemblyRepository,
} from "../../../features/workout-assembly/repository";
import {
  InMemoryWorkoutBlueprintRepository,
  type WorkoutBlueprintRepository,
} from "../../../features/workout-blueprint/repository";
import type { CompositionConfiguration } from "../configuration/CompositionConfiguration";

/**
 * Provides in-memory repositories for pipeline services.
 * No persistence. No networking.
 */
export class RepositoryProvider {
  constructor(
    private readonly configuration: CompositionConfiguration,
  ) {
    void this.configuration; // locked to in-memory for this sprint
  }

  workoutBlueprint(): WorkoutBlueprintRepository {
    return new InMemoryWorkoutBlueprintRepository();
  }

  /** Shared module singleton — matches existing createExerciseSelectionService default. */
  exerciseSelection(): SelectionRepository {
    return selectionRepository;
  }

  programming(): ProgrammingRepository {
    return programmingRepository;
  }

  progression(): ProgressionRepository {
    return progressionRepository;
  }

  trainingAdaptation(): TrainingAdaptationRepository {
    return trainingAdaptationRepository;
  }

  workoutAssembly(): WorkoutAssemblyRepository {
    return workoutAssemblyRepository;
  }

  /** Fresh empty repos for isolated transient/test wiring. */
  emptyExerciseSelection(): SelectionRepository {
    return new InMemorySelectionRepository();
  }

  emptyProgramming(): ProgrammingRepository {
    return new InMemoryProgrammingRepository();
  }

  emptyProgression(): ProgressionRepository {
    return new InMemoryProgressionRepository();
  }

  emptyTrainingAdaptation(): TrainingAdaptationRepository {
    return new InMemoryTrainingAdaptationRepository();
  }

  emptyWorkoutAssembly(): WorkoutAssemblyRepository {
    return new InMemoryWorkoutAssemblyRepository();
  }
}
