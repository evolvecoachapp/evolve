import type { WorkoutExercise } from "./WorkoutExercise";
import type { WorkoutNotes } from "./WorkoutNotes";
import type { WorkoutProgress } from "./WorkoutProgress";
import type { WorkoutRuntimeState } from "./WorkoutRuntimeState";
import type { WorkoutStatistics } from "./WorkoutStatistics";
import type { WorkoutTimer } from "./WorkoutTimer";

/**
 * Immutable operational WorkoutRuntime read model (Sprint 31.2 presentation).
 * Distinct from the Sprint 18.0 engine `WorkoutRuntime` domain graph.
 */
export interface WorkoutRuntime {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly muscleGroups: string;
  readonly exercises: readonly WorkoutExercise[];
  readonly currentExerciseIndex: number;
  readonly currentSetIndex: number;
  readonly progress: WorkoutProgress;
  readonly timer: WorkoutTimer;
  readonly statistics: WorkoutStatistics;
  readonly notes: WorkoutNotes;
  readonly state: WorkoutRuntimeState;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly historyDestination: string;
  readonly statisticsDestination: string;
  readonly isEmpty: boolean;
}

export function createWorkoutRuntime(input: WorkoutRuntime): WorkoutRuntime {
  return Object.freeze({
    ...input,
    exercises: Object.freeze([...input.exercises]),
  });
}
