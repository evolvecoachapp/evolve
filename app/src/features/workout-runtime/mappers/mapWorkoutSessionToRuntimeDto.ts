import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkspaceWorkout } from "../../unified-workspace/models/WorkspaceWorkout";
import type {
  WorkoutExerciseDto,
  WorkoutRuntimeDto,
  WorkoutSetDto,
} from "../types/workoutRuntimeDto";

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function mapSet(
  exerciseId: string,
  setIndex: number,
  repMin: number,
  repMax: number,
  targetRpe: number | null,
  restSeconds: number,
): WorkoutSetDto {
  return Object.freeze({
    id: `${exerciseId}:set:${setIndex + 1}`,
    targetReps: repMin,
    targetRepsMax: repMax !== repMin ? repMax : null,
    targetRpe,
    restSeconds,
  });
}

function mapExercise(
  exercise: WorkoutSession["exercises"][number],
): WorkoutExerciseDto {
  const sets = Object.freeze(
    exercise.sets.map((set) =>
      mapSet(
        exercise.id,
        set.setIndex,
        set.repMin,
        set.repMax,
        set.targetRpe,
        exercise.betweenSetsRestSeconds > 0
          ? exercise.betweenSetsRestSeconds
          : exercise.restSeconds,
      ),
    ),
  );

  return Object.freeze({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: formatRole(exercise.role),
    equipment: exercise.notes[0] ?? "General",
    sets,
  });
}

/** Maps an assembled WorkoutSession into the experience provider DTO shape. */
export function mapWorkoutSessionToRuntimeDto(
  session: WorkoutSession,
  workout: WorkspaceWorkout,
): WorkoutRuntimeDto {
  const exercises = Object.freeze(session.exercises.map(mapExercise));
  const muscleGroups = exercises
    .map((exercise) => exercise.muscleGroup)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");

  return Object.freeze({
    id: session.id,
    title: workout.planName?.trim() || session.name,
    subtitle: workout.currentPhase?.trim() || "Today's workout",
    muscleGroups: muscleGroups || workout.summary.trim(),
    exercises,
    sessionNotes: session.notes.join("\n"),
    startedAt: null,
    empty: exercises.length === 0,
  });
}
