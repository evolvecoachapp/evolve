import type { WorkoutProgram } from "../../workout/types/workout-program";
import type { WorkoutWeek as UiWorkoutWeek } from "../../workout/types/workout-week";
import type { WorkoutDay as UiWorkoutDay } from "../../workout/types/workout-day";
import type { WorkoutExercise as UiWorkoutExercise } from "../../workout/types/workout-exercise";
import type { ExerciseSet } from "../../workout/types/exercise-set";
import type { WorkoutPlan } from "../models/WorkoutPlan";

/**
 * Adapter: canonical WorkoutPlan → legacy UI WorkoutProgram.
 * Existing workout screens keep working without consuming assembly types directly.
 */
export function mapWorkoutPlanToWorkoutProgram(
  plan: WorkoutPlan,
): WorkoutProgram {
  const weeks: UiWorkoutWeek[] = plan.weeks.map((week) => {
    const days: UiWorkoutDay[] = week.days.map((day) => {
      const exercises: UiWorkoutExercise[] = (day.session?.exercises ?? []).map(
        (exercise) => {
          const workingSets: ExerciseSet[] = exercise.sets.map((set) => ({
            id: `${exercise.id}-set-${set.setIndex}`,
            setNumber: set.setIndex,
            targetWeight: null,
            targetReps: set.repMax,
            completedReps: null,
            rir: set.targetRir,
            rpe: set.targetRpe,
            percentage: null,
            restSeconds: exercise.betweenSetsRestSeconds,
            completed: false,
          }));
          return {
            id: exercise.id,
            name: exercise.name,
            muscleGroup: "back",
            equipment: "barbell",
            notes: exercise.notes.join("; ") || null,
            warmupSets: [],
            workingSets,
            estimatedDurationSeconds: exercise.estimatedDurationSeconds,
            coachNotes: exercise.cues.join("; ") || null,
          };
        },
      );

      return {
        id: day.id,
        dayNumber: day.dayNumber,
        label: day.label,
        focus: day.focus,
        estimatedDurationMinutes: Math.round(day.estimatedDurationSeconds / 60),
        isRestDay: day.isRestDay,
        exercises,
      };
    });

    return {
      id: week.id,
      weekNumber: week.weekNumber,
      label: week.label,
      theme: week.theme,
      days,
    };
  });

  return {
    id: plan.id,
    name: plan.name,
    description: plan.summary.message,
    goal: "general",
    durationWeeks: Math.max(1, plan.statistics.weekCount),
    weeks,
    metadata: {
      intensityModel: "rpe",
      oneRepMaxes: {},
      coachingNotes: [...plan.notes.coachNotes],
      blockLengthWeeks: Math.max(1, plan.statistics.weekCount),
      author: "workout_generation_pipeline",
      version: plan.metadata.pipelineVersion,
    },
  };
}
