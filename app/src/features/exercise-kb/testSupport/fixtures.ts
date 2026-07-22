import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import type { AllowedGoalCode, AllowedTrainingStyleCode } from "../models/ExerciseDefinition";
import type { ExerciseCategoryCode, PushPullLegsCode } from "../models/ExerciseCategory";
import type { ExerciseConstraint } from "../models/ExerciseConstraint";
import type { ExerciseDifficultyLevel } from "../models/ExerciseDifficulty";
import type { EquipmentCode } from "../models/EquipmentRequirement";
import type { ExerciseRelationship } from "../models/ExerciseRelationship";
import type { ExerciseTagCode } from "../models/ExerciseTag";
import type { ExerciseVariant } from "../models/ExerciseVariant";
import type { MovementPatternCode } from "../models/MovementPattern";
import type { PrimaryMuscleGroupCode } from "../models/PrimaryMuscleGroup";
import { freezeExerciseDefinition } from "../utils/freezeExerciseDefinition";

export const FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export interface ExerciseDefinitionInput {
  readonly id: string;
  readonly name: string;
  readonly movementPattern: MovementPatternCode;
  readonly primaryMuscles: readonly PrimaryMuscleGroupCode[];
  readonly secondaryMuscles?: readonly PrimaryMuscleGroupCode[];
  readonly equipment: readonly EquipmentCode[];
  readonly difficulty?: ExerciseDifficultyLevel;
  readonly skillScore?: number;
  readonly category?: ExerciseCategoryCode;
  readonly pushPullLegs: PushPullLegsCode;
  readonly isUnilateral?: boolean;
  readonly isCompound?: boolean;
  readonly allowedGoals?: readonly AllowedGoalCode[];
  readonly allowedTrainingStyles?: readonly AllowedTrainingStyleCode[];
  readonly fatigueScore: number;
  readonly jointStress: number;
  readonly axialLoading: boolean;
  readonly variants?: readonly ExerciseVariant[];
  readonly constraints?: readonly ExerciseConstraint[];
  readonly contraindications?: readonly string[];
  readonly relationships?: readonly ExerciseRelationship[];
  readonly tags?: readonly ExerciseTagCode[];
}

/**
 * Build a frozen ExerciseDefinition from a compact input shape.
 */
export function createExerciseDefinition(
  input: ExerciseDefinitionInput,
): ExerciseDefinition {
  const level = input.difficulty ?? "intermediate";
  const skillScore =
    input.skillScore ??
    (level === "beginner"
      ? 2
      : level === "intermediate"
        ? 5
        : level === "advanced"
          ? 7
          : 9);

  return freezeExerciseDefinition({
    id: input.id,
    name: input.name,
    movementPattern: { code: input.movementPattern },
    primaryMuscles: input.primaryMuscles.map((code) => ({ code })),
    secondaryMuscles: (input.secondaryMuscles ?? []).map((code) => ({ code })),
    equipment: input.equipment.map((equipment) => ({
      equipment,
      required: true,
    })),
    difficulty: { level, skillScore },
    category: {
      code: input.category ?? (input.isCompound === false ? "isolation" : "compound"),
      pushPullLegs: input.pushPullLegs,
      isUnilateral: input.isUnilateral ?? false,
      isCompound: input.isCompound ?? true,
    },
    allowedGoals: input.allowedGoals ?? [
      "strength",
      "hypertrophy",
      "general_fitness",
    ],
    allowedTrainingStyles: input.allowedTrainingStyles ?? [
      "powerlifting",
      "bodybuilding",
      "general",
    ],
    fatigueScore: input.fatigueScore,
    jointStress: input.jointStress,
    axialLoading: input.axialLoading,
    variants: input.variants ?? [],
    constraints: input.constraints ?? [],
    contraindications: input.contraindications ?? [],
    relationships: input.relationships ?? [],
    metadata: {
      version: "1.0.0",
      source: "catalog",
      createdAt: FIXED_TIMESTAMP,
      updatedAt: FIXED_TIMESTAMP,
      tags: (input.tags ?? []).map((code) => ({ code })),
    },
  });
}
