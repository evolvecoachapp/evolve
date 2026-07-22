import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkoutRuntime } from "../models/WorkoutRuntime";

/**
 * Structural validation of a runtime against its source session.
 */
export function validateRuntimeStructure(
  runtime: WorkoutRuntime,
): readonly string[] {
  const issues: string[] = [];

  if (runtime.sessionId !== runtime.session.id) {
    issues.push(
      `session_id_mismatch:${runtime.sessionId}:${runtime.session.id}`,
    );
  }

  if (runtime.exercises.length !== runtime.session.exercises.length) {
    issues.push(
      `exercise_count_mismatch:${runtime.exercises.length}:${runtime.session.exercises.length}`,
    );
  }

  const sessionExerciseIds = new Set(
    runtime.session.exercises.map((exercise) => exercise.id),
  );

  for (const exercise of runtime.exercises) {
    if (!sessionExerciseIds.has(exercise.workoutExerciseId)) {
      issues.push(`unknown_workout_exercise:${exercise.workoutExerciseId}`);
    }

    const prescribed = runtime.session.exercises.find(
      (item) => item.id === exercise.workoutExerciseId,
    );
    if (prescribed && prescribed.sets.length !== exercise.sets.length) {
      issues.push(
        `set_count_mismatch:${exercise.id}:${exercise.sets.length}:${prescribed.sets.length}`,
      );
    }
  }

  if (
    runtime.currentExerciseIndex !== null &&
    (runtime.currentExerciseIndex < 0 ||
      runtime.currentExerciseIndex >= runtime.exercises.length)
  ) {
    issues.push(`invalid_current_exercise_index:${runtime.currentExerciseIndex}`);
  }

  return Object.freeze(Array.from(new Set(issues)));
}

/**
 * Validate that a WorkoutSession can seed a runtime.
 */
export function validateSessionForRuntime(
  session: WorkoutSession,
): readonly string[] {
  const issues: string[] = [];

  if (!session.id) {
    issues.push("missing_session_id");
  }

  if (session.exercises.length === 0) {
    issues.push("empty_session");
  }

  for (const exercise of session.exercises) {
    if (exercise.sets.length === 0) {
      issues.push(`exercise_without_sets:${exercise.id}`);
    }
  }

  return Object.freeze(issues);
}
