import type { Workout } from "../models/Workout";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { Exercise } from "../models/Exercise";
import { enrichExercise } from "../utils/exerciseEnrichment";
import type { ExerciseSet } from "../models/ExerciseSet";
import type { WorkoutExercise as LegacyWorkoutExercise } from "../types/workout-exercise";
import type { ExerciseSet as LegacyExerciseSet } from "../types/exercise-set";
import { powerbuildingProgram } from "./powerbuildingProgram";

function toModelExerciseSet(set: LegacyExerciseSet): ExerciseSet {
  return {
    id: set.id,
    setNumber: set.setNumber,
    targetReps: set.targetReps,
    targetWeight: set.targetWeight,
    completedReps: set.completedReps,
    completedWeight: set.completedWeight ?? null,
    rpe: set.rpe,
    completed: set.completed,
    restSeconds: set.restSeconds,
    percentage: set.percentage,
    rir: set.rir,
    perceivedDifficulty: set.perceivedDifficulty ?? null,
  };
}

function toModelExercise(legacy: LegacyWorkoutExercise): Exercise {
  return enrichExercise({
    id: legacy.id,
    name: legacy.name,
    muscleGroup: legacy.muscleGroup,
    equipment: legacy.equipment,
    instructions: legacy.notes,
    videoUrl: legacy.videoUrl ?? null,
    imageUrl: legacy.thumbnail ?? null,
    primaryMuscles: legacy.primaryMuscles,
    secondaryMuscles: legacy.secondaryMuscles,
  });
}

function toModelWorkoutExercise(legacy: LegacyWorkoutExercise, order: number): WorkoutExercise {
  return {
    id: legacy.id,
    exercise: toModelExercise(legacy),
    order,
    warmupSets: legacy.warmupSets.map(toModelExerciseSet),
    workingSets: legacy.workingSets.map(toModelExerciseSet),
    notes: legacy.notes,
    skipped: false,
  };
}

interface LegacyDayToWorkoutInput {
  id: string;
  programName: string;
  weekLabel: string;
  dayLabel: string;
  focus: string;
  estimatedDurationMinutes: number;
  exercises: LegacyWorkoutExercise[];
  coachRecommendations: string[];
  notes?: string | null;
}

/** Converts legacy mock program data into the production Workout model. */
export function legacyDayToWorkout(input: LegacyDayToWorkoutInput): Workout {
  const exercises = input.exercises.map((exercise, index) =>
    toModelWorkoutExercise(exercise, index + 1),
  );

  return {
    id: input.id,
    title: input.programName,
    subtitle: input.focus,
    estimatedDuration: input.estimatedDurationMinutes,
    exercises,
    warmup: [],
    cooldown: [],
    notes: input.notes ?? null,
    coachRecommendations: input.coachRecommendations,
    scheduleLabels: {
      weekLabel: input.weekLabel,
      dayLabel: input.dayLabel,
    },
  };
}

/** Catalog of mock workouts derived from the legacy powerbuilding program seed. */
export function buildMockWorkoutCatalog(): Workout[] {
  return powerbuildingProgram.weeks.flatMap((week) =>
    week.days
      .filter((day) => !day.isRestDay)
      .map((day) =>
        legacyDayToWorkout({
          id: day.id,
          programName: powerbuildingProgram.name,
          weekLabel: week.label,
          dayLabel: day.label,
          focus: day.focus,
          estimatedDurationMinutes: day.estimatedDurationMinutes,
          exercises: day.exercises,
          coachRecommendations: powerbuildingProgram.metadata.coachingNotes ?? [],
          notes: powerbuildingProgram.description,
        }),
      ),
  );
}

/** Mock cursor — today's scheduled slot until backend resolution is wired. */
export const MOCK_TODAY_WORKOUT_ID = "pb-w1-d1";
