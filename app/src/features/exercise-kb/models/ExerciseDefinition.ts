import type { EquipmentRequirement } from "./EquipmentRequirement";
import type { ExerciseCategory } from "./ExerciseCategory";
import type { ExerciseConstraint } from "./ExerciseConstraint";
import type { ExerciseDifficulty } from "./ExerciseDifficulty";
import type { ExerciseMetadata } from "./ExerciseMetadata";
import type { ExerciseRelationship } from "./ExerciseRelationship";
import type { ExerciseVariant } from "./ExerciseVariant";
import type { MovementPattern } from "./MovementPattern";
import type { PrimaryMuscleGroup } from "./PrimaryMuscleGroup";
import type { SecondaryMuscleGroup } from "./SecondaryMuscleGroup";

/** Allowed training goal codes for an exercise. */
export type AllowedGoalCode =
  | "strength"
  | "hypertrophy"
  | "power"
  | "endurance"
  | "general_fitness"
  | "mobility"
  | "rehabilitation";

export const ALLOWED_GOAL_CODES = Object.freeze([
  "strength",
  "hypertrophy",
  "power",
  "endurance",
  "general_fitness",
  "mobility",
  "rehabilitation",
] as const satisfies readonly AllowedGoalCode[]);

/** Allowed training style codes for an exercise. */
export type AllowedTrainingStyleCode =
  | "powerlifting"
  | "bodybuilding"
  | "athletic"
  | "general"
  | "rehabilitation"
  | "olympic_weightlifting";

export const ALLOWED_TRAINING_STYLE_CODES = Object.freeze([
  "powerlifting",
  "bodybuilding",
  "athletic",
  "general",
  "rehabilitation",
  "olympic_weightlifting",
] as const satisfies readonly AllowedTrainingStyleCode[]);

/**
 * Immutable exercise knowledge entry.
 *
 * Structured metadata only. Never contains sets, reps, weight,
 * athlete state, or workout references.
 */
export interface ExerciseDefinition {
  readonly id: string;
  readonly name: string;
  readonly movementPattern: MovementPattern;
  readonly primaryMuscles: readonly PrimaryMuscleGroup[];
  readonly secondaryMuscles: readonly SecondaryMuscleGroup[];
  readonly equipment: readonly EquipmentRequirement[];
  readonly difficulty: ExerciseDifficulty;
  readonly category: ExerciseCategory;
  readonly allowedGoals: readonly AllowedGoalCode[];
  readonly allowedTrainingStyles: readonly AllowedTrainingStyleCode[];
  /** Systemic fatigue contribution in [0, 10]. */
  readonly fatigueScore: number;
  /** Joint stress score in [0, 10]. */
  readonly jointStress: number;
  /** Whether the movement imposes meaningful axial (spinal) loading. */
  readonly axialLoading: boolean;
  readonly variants: readonly ExerciseVariant[];
  readonly constraints: readonly ExerciseConstraint[];
  /** Contraindication codes (subset of constraint codes for convenience). */
  readonly contraindications: readonly string[];
  readonly relationships: readonly ExerciseRelationship[];
  readonly metadata: ExerciseMetadata;
}
