import type { Workout } from "../models/Workout";
import type { WorkoutExercise as ModelWorkoutExercise } from "../models/WorkoutExercise";
import type { ExerciseSet as ModelExerciseSet } from "../models/ExerciseSet";
import type { ExerciseSet, WorkoutDay, WorkoutExercise } from "../types";

/** Maps a production exercise set to the legacy presentation shape. */
export function toLegacyExerciseSet(set: ModelExerciseSet): ExerciseSet {
  return {
    id: set.id,
    setNumber: set.setNumber,
    targetWeight: set.targetWeight,
    targetReps: set.targetReps,
    completedReps: set.completedReps,
    rir: set.rir ?? null,
    rpe: set.rpe,
    percentage: set.percentage ?? null,
    restSeconds: set.restSeconds,
    completed: set.completed,
    completedWeight: set.completedWeight,
    perceivedDifficulty: set.perceivedDifficulty ?? null,
  };
}

/** Maps a production workout exercise to the legacy presentation shape. */
export function toLegacyWorkoutExercise(exercise: ModelWorkoutExercise): WorkoutExercise {
  return {
    id: exercise.id,
    name: exercise.exercise.name,
    muscleGroup: exercise.exercise.muscleGroup,
    equipment: exercise.exercise.equipment,
    notes: exercise.notes ?? exercise.exercise.instructions,
    warmupSets: exercise.warmupSets.map(toLegacyExerciseSet),
    workingSets: exercise.workingSets.map(toLegacyExerciseSet),
    videoUrl: exercise.exercise.videoUrl,
    thumbnail: exercise.exercise.imageUrl,
  };
}

/** Builds a legacy day view for existing presentation formatters. */
export function toPresentationDay(workout: Workout): WorkoutDay {
  const exercises = workout.exercises.map(toLegacyWorkoutExercise);

  return {
    id: workout.id,
    dayNumber: 1,
    label: workout.scheduleLabels.dayLabel,
    focus: workout.subtitle,
    estimatedDurationMinutes: workout.estimatedDuration,
    isRestDay: false,
    exercises,
  };
}

/** Deep-clones a production workout so session mutations never alter templates. */
export function cloneWorkout(workout: Workout): Workout {
  return {
    ...workout,
    scheduleLabels: { ...workout.scheduleLabels },
    coachRecommendations: [...workout.coachRecommendations],
    warmup: workout.warmup.map(cloneWorkoutExercise),
    cooldown: workout.cooldown.map(cloneWorkoutExercise),
    exercises: workout.exercises.map(cloneWorkoutExercise),
  };
}

/** Deep-clones workout exercises so session mutations never alter templates. */
export function cloneWorkoutExercises(exercises: ModelWorkoutExercise[]): ModelWorkoutExercise[] {
  return exercises.map(cloneWorkoutExercise);
}

function cloneWorkoutExercise(exercise: ModelWorkoutExercise): ModelWorkoutExercise {
  return {
    ...exercise,
    exercise: { ...exercise.exercise },
    warmupSets: exercise.warmupSets.map((set) => ({ ...set })),
    workingSets: exercise.workingSets.map((set) => ({ ...set })),
  };
}
