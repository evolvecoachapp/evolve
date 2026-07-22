import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import { createExerciseDefinition } from "../../exercise-kb/testSupport/fixtures";
import {
  createWorkoutBlueprint,
  createWorkoutDayBlueprint,
} from "../../workout-blueprint/testSupport/fixtures";
import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { SelectionContext } from "../models/SelectionContext";
import { buildSelectionContext } from "../utils/buildSelectionContext";

export const FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export function createSelectionCatalog(): readonly ExerciseDefinition[] {
  return Object.freeze([
    createExerciseDefinition({
      id: "back-squat",
      name: "Back Squat",
      movementPattern: "squat",
      primaryMuscles: ["quads"],
      secondaryMuscles: ["glutes"],
      equipment: ["barbell"],
      difficulty: "intermediate",
      pushPullLegs: "legs",
      isCompound: true,
      fatigueScore: 9,
      jointStress: 7,
      axialLoading: true,
      allowedGoals: ["strength", "hypertrophy", "general_fitness"],
      contraindications: ["acute_knee_pain"],
      constraints: [
        { kind: "contraindication", code: "acute_knee_pain", severity: "hard" },
      ],
      relationships: [
        { kind: "alternative", targetExerciseId: "goblet-squat", strength: 0.8 },
      ],
      tags: ["squat_pattern", "lower_body"],
    }),
    createExerciseDefinition({
      id: "goblet-squat",
      name: "Goblet Squat",
      movementPattern: "squat",
      primaryMuscles: ["quads"],
      equipment: ["dumbbell"],
      difficulty: "beginner",
      pushPullLegs: "legs",
      isCompound: true,
      fatigueScore: 5,
      jointStress: 4,
      axialLoading: false,
      allowedGoals: ["hypertrophy", "general_fitness"],
      tags: ["squat_pattern", "lower_body"],
    }),
    createExerciseDefinition({
      id: "romanian-deadlift",
      name: "Romanian Deadlift",
      movementPattern: "hinge",
      primaryMuscles: ["hamstrings"],
      secondaryMuscles: ["glutes", "lower_back"],
      equipment: ["barbell"],
      difficulty: "intermediate",
      pushPullLegs: "legs",
      isCompound: true,
      fatigueScore: 7,
      jointStress: 6,
      axialLoading: true,
      allowedGoals: ["strength", "hypertrophy"],
      tags: ["hinge_pattern", "posterior_chain"],
    }),
    createExerciseDefinition({
      id: "bench-press",
      name: "Bench Press",
      movementPattern: "horizontal_push",
      primaryMuscles: ["chest"],
      secondaryMuscles: ["triceps", "shoulders"],
      equipment: ["barbell"],
      difficulty: "intermediate",
      pushPullLegs: "push",
      isCompound: true,
      fatigueScore: 7,
      jointStress: 5,
      axialLoading: false,
      allowedGoals: ["strength", "hypertrophy", "power"],
      relationships: [
        {
          kind: "alternative",
          targetExerciseId: "dumbbell-bench-press",
          strength: 0.85,
        },
      ],
      tags: ["press", "upper_body"],
    }),
    createExerciseDefinition({
      id: "dumbbell-bench-press",
      name: "Dumbbell Bench Press",
      movementPattern: "horizontal_push",
      primaryMuscles: ["chest"],
      secondaryMuscles: ["triceps"],
      equipment: ["dumbbell"],
      difficulty: "beginner",
      pushPullLegs: "push",
      isCompound: true,
      fatigueScore: 5,
      jointStress: 4,
      axialLoading: false,
      allowedGoals: ["hypertrophy", "general_fitness"],
      tags: ["press", "upper_body"],
    }),
    createExerciseDefinition({
      id: "barbell-row",
      name: "Barbell Row",
      movementPattern: "horizontal_pull",
      primaryMuscles: ["lats"],
      secondaryMuscles: ["biceps", "upper_back"],
      equipment: ["barbell"],
      difficulty: "intermediate",
      pushPullLegs: "pull",
      isCompound: true,
      fatigueScore: 6,
      jointStress: 5,
      axialLoading: false,
      allowedGoals: ["strength", "hypertrophy"],
      tags: ["pull", "upper_body"],
    }),
    createExerciseDefinition({
      id: "leg-extension",
      name: "Leg Extension",
      movementPattern: "isolation",
      primaryMuscles: ["quads"],
      equipment: ["machine"],
      difficulty: "beginner",
      category: "isolation",
      pushPullLegs: "legs",
      isCompound: false,
      fatigueScore: 3,
      jointStress: 4,
      axialLoading: false,
      allowedGoals: ["hypertrophy", "general_fitness"],
      tags: ["accessory", "lower_body"],
    }),
    createExerciseDefinition({
      id: "tricep-pushdown",
      name: "Tricep Pushdown",
      movementPattern: "isolation",
      primaryMuscles: ["triceps"],
      equipment: ["cable"],
      difficulty: "beginner",
      category: "isolation",
      pushPullLegs: "push",
      isCompound: false,
      fatigueScore: 2,
      jointStress: 2,
      axialLoading: false,
      allowedGoals: ["hypertrophy", "general_fitness"],
      tags: ["accessory"],
    }),
    createExerciseDefinition({
      id: "muscle-snatch",
      name: "Muscle Snatch",
      movementPattern: "other",
      primaryMuscles: ["traps"],
      secondaryMuscles: ["shoulders"],
      equipment: ["barbell"],
      difficulty: "expert",
      category: "olympic",
      pushPullLegs: "other",
      isCompound: true,
      fatigueScore: 8,
      jointStress: 7,
      axialLoading: true,
      allowedGoals: ["power"],
      tags: ["advanced"],
    }),
  ]);
}

export function createUpperBodySelectionRequest(
  overrides: Partial<ExerciseSelectionRequest> = {},
): ExerciseSelectionRequest {
  const blueprint =
    overrides.blueprint ??
    createWorkoutBlueprint({
      id: "bp-upper",
      priority: { primary: "hypertrophy", secondary: "strength" },
      focus: { primary: "upper_body", secondary: "push" },
      constraints: [],
      days: [
        createWorkoutDayBlueprint({
          id: "day-upper",
          dayIndex: 0,
          name: "Upper A",
          isRestDay: false,
          focus: { primary: "upper_body", secondary: "push" },
          sessionGoal: "primary_lift_emphasis",
        }),
        createWorkoutDayBlueprint({
          id: "day-rest",
          dayIndex: 1,
          name: "Rest",
          isRestDay: true,
          sessionGoal: "rest",
        }),
      ],
    });

  return Object.freeze({
    blueprint,
    dayId: overrides.dayId ?? "day-upper",
    availableEquipment: overrides.availableEquipment,
    maxDifficulty: overrides.maxDifficulty,
    excludedExerciseIds: overrides.excludedExerciseIds,
    maxCandidatesPerRole: overrides.maxCandidatesPerRole,
    includeExplanations: overrides.includeExplanations,
  });
}

export function createLowerBodySelectionRequest(
  overrides: Partial<ExerciseSelectionRequest> = {},
): ExerciseSelectionRequest {
  const blueprint =
    overrides.blueprint ??
    createWorkoutBlueprint({
      id: "bp-lower",
      priority: { primary: "strength", secondary: "hypertrophy" },
      focus: { primary: "lower_body", secondary: "posterior_chain" },
      constraints: [
        {
          kind: "injury",
          code: "acute_knee_pain",
          severity: "hard",
        },
      ],
      days: [
        createWorkoutDayBlueprint({
          id: "day-lower",
          dayIndex: 0,
          name: "Lower A",
          isRestDay: false,
          focus: { primary: "lower_body", secondary: "posterior_chain" },
          sessionGoal: "primary_lift_emphasis",
        }),
      ],
    });

  return Object.freeze({
    blueprint,
    dayId: overrides.dayId ?? "day-lower",
    availableEquipment: overrides.availableEquipment,
    maxDifficulty: overrides.maxDifficulty,
    excludedExerciseIds: overrides.excludedExerciseIds,
    maxCandidatesPerRole: overrides.maxCandidatesPerRole,
    includeExplanations: overrides.includeExplanations,
  });
}

export function createTestSelectionContext(
  overrides: Partial<ExerciseSelectionRequest> = {},
): SelectionContext {
  return buildSelectionContext(createUpperBodySelectionRequest(overrides));
}
