import type { ExerciseSet } from "../models/ExerciseSet";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { SavedSetResult } from "../types/workoutService";

/** The next working set the athlete should perform in an active session. */
export interface SessionPosition {
  exerciseIndex: number;
  setIndex: number;
  exercise: WorkoutExercise;
  set: ExerciseSet;
}

/** Locate the first incomplete working set, skipping flagged exercises. */
export function findNextIncompleteSet(session: WorkoutSession): SessionPosition | null {
  for (let exerciseIndex = 0; exerciseIndex < session.exercises.length; exerciseIndex += 1) {
    const exercise = session.exercises[exerciseIndex];
    if (exercise.skipped) {
      continue;
    }

    for (let setIndex = 0; setIndex < exercise.workingSets.length; setIndex += 1) {
      const set = exercise.workingSets[setIndex];
      if (!set.completed) {
        return { exerciseIndex, setIndex, exercise, set };
      }
    }
  }

  return null;
}

/** Whether every non-skipped working set has been logged. */
export function isSessionComplete(session: WorkoutSession): boolean {
  return findNextIncompleteSet(session) === null;
}

/** Sum weight × reps across completed working sets. */
export function computeSessionVolumeKg(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.workingSets.reduce((setTotal, set) => {
        if (!set.completed) {
          return setTotal;
        }
        const weight = set.completedWeight ?? 0;
        const reps = set.completedReps ?? 0;
        return setTotal + weight * reps;
      }, 0)
    );
  }, 0);
}

/** Count exercises with at least one logged working set. */
export function countCompletedExercises(exercises: WorkoutExercise[]): number {
  return exercises.filter(
    (exercise) => !exercise.skipped && exercise.workingSets.some((set) => set.completed),
  ).length;
}

/** Count non-skipped exercises in the session. */
export function countTotalExercises(exercises: WorkoutExercise[]): number {
  return exercises.filter((exercise) => !exercise.skipped).length;
}

/** Count non-skipped exercises that still have incomplete working sets. */
export function countRemainingExercises(session: WorkoutSession): number {
  return session.exercises.filter((exercise) => {
    if (exercise.skipped) {
      return false;
    }
    return exercise.workingSets.some((set) => !set.completed);
  }).length;
}

/** Total working sets across non-skipped exercises — the denominator for session-wide progress. */
export function countSessionWorkingSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (total, exercise) => (exercise.skipped ? total : total + exercise.workingSets.length),
    0,
  );
}

/** Logged working sets across non-skipped exercises — the numerator for session-wide progress. */
export function countSessionCompletedWorkingSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (total, exercise) =>
      exercise.skipped ? total : total + exercise.workingSets.filter((set) => set.completed).length,
    0,
  );
}

/**
 * Returns a new `WorkoutSession` with the working set identified by
 * `exerciseId`/`setId` replaced by a server-confirmed `SavedSetResult`.
 *
 * Lets `useActiveWorkoutSession` advance the UI immediately after a
 * successful `saveSet` write instead of waiting on a full session re-fetch —
 * the placeholder set's local id is swapped for the real persisted id, and
 * its target/rest prescription is preserved.
 */
export function mergeSavedSetIntoSession(
  session: WorkoutSession,
  exerciseId: string,
  setId: string,
  saved: SavedSetResult,
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => {
      if (exercise.id !== exerciseId) {
        return exercise;
      }

      return {
        ...exercise,
        workingSets: exercise.workingSets.map((set) =>
          set.id === setId
            ? {
                ...set,
                id: saved.id,
                completedReps: saved.completedReps,
                completedWeight: saved.completedWeight,
                rpe: saved.rpe,
                completed: true,
              }
            : set,
        ),
      };
    }),
  };
}
