import type { Exercise } from "../models/Exercise";
import type { ExerciseMuscleGroup } from "../models/ExerciseMuscleGroup";

interface ExerciseEnrichment {
  primaryMuscles?: ExerciseMuscleGroup[];
  secondaryMuscles?: ExerciseMuscleGroup[];
  commonMistakes?: string[];
}

/** Static enrichment for mock catalog exercises until catalog metadata is fully wired. */
const EXERCISE_ENRICHMENT: Record<string, ExerciseEnrichment> = {
  "ex-low-bar-squat": {
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    commonMistakes: [
      "Knees caving inward on the ascent",
      "Losing upper-back tightness",
      "Bouncing out of the hole",
    ],
  },
  "ex-bench-press": {
    primaryMuscles: ["chest"],
    secondaryMuscles: ["shoulders", "triceps"],
    commonMistakes: [
      "Flaring elbows too wide",
      "Losing shoulder-blade retraction",
      "Bouncing the bar off the chest",
    ],
  },
  "ex-deadlift": {
    primaryMuscles: ["back", "hamstrings"],
    secondaryMuscles: ["glutes", "core"],
    commonMistakes: [
      "Rounding the lower back",
      "Jerking the bar off the floor",
      "Hips shooting up before the chest",
    ],
  },
  "ex-overhead-press": {
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "core"],
    commonMistakes: [
      "Excessive lower-back arch",
      "Pressing the bar forward instead of up",
      "Incomplete lockout overhead",
    ],
  },
};

/** Applies catalog enrichment defaults to an exercise definition. */
export function enrichExercise(exercise: Exercise): Exercise {
  const enrichment = EXERCISE_ENRICHMENT[exercise.id];
  return {
    ...exercise,
    primaryMuscles: enrichment?.primaryMuscles ?? exercise.primaryMuscles ?? [exercise.muscleGroup],
    secondaryMuscles: enrichment?.secondaryMuscles ?? exercise.secondaryMuscles ?? [],
    commonMistakes: enrichment?.commonMistakes ?? exercise.commonMistakes ?? [],
  };
}
