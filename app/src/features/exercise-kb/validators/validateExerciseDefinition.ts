import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import {
  ALLOWED_GOAL_CODES,
  ALLOWED_TRAINING_STYLE_CODES,
} from "../models/ExerciseDefinition";
import { EXERCISE_CATEGORY_CODES, PUSH_PULL_LEGS_CODES } from "../models/ExerciseCategory";
import { EXERCISE_DIFFICULTY_LEVELS } from "../models/ExerciseDifficulty";
import { EQUIPMENT_CODES } from "../models/EquipmentRequirement";
import { MOVEMENT_PATTERN_CODES } from "../models/MovementPattern";
import { PRIMARY_MUSCLE_GROUP_CODES } from "../models/PrimaryMuscleGroup";
import { validateConstraints } from "./validateConstraints";
import { validateMetadata } from "./validateMetadata";
import { validateRelationships } from "./validateRelationships";

export type ExerciseDefinitionValidationCode =
  | "missing_id"
  | "missing_name"
  | "invalid_movement_pattern"
  | "invalid_primary_muscles"
  | "invalid_secondary_muscles"
  | "invalid_equipment"
  | "invalid_difficulty"
  | "invalid_category"
  | "invalid_allowed_goals"
  | "invalid_allowed_training_styles"
  | "invalid_fatigue_score"
  | "invalid_joint_stress"
  | "invalid_axial_loading"
  | "invalid_variants"
  | "invalid_constraints"
  | "invalid_contraindications"
  | "invalid_relationships"
  | "invalid_metadata";

/**
 * Validate an ExerciseDefinition structural contract.
 * Pure — no I/O, no mutation.
 */
export function validateExerciseDefinition(
  definition: unknown,
): readonly ExerciseDefinitionValidationCode[] {
  const issues: ExerciseDefinitionValidationCode[] = [];

  if (definition === null || typeof definition !== "object") {
    return Object.freeze([
      "missing_id",
      "missing_name",
      "invalid_movement_pattern",
      "invalid_primary_muscles",
      "invalid_equipment",
      "invalid_difficulty",
      "invalid_category",
      "invalid_allowed_goals",
      "invalid_allowed_training_styles",
      "invalid_fatigue_score",
      "invalid_joint_stress",
      "invalid_axial_loading",
      "invalid_variants",
      "invalid_constraints",
      "invalid_contraindications",
      "invalid_relationships",
      "invalid_metadata",
    ]);
  }

  const candidate = definition as Partial<ExerciseDefinition>;

  if (typeof candidate.id !== "string" || candidate.id.trim().length === 0) {
    issues.push("missing_id");
  }

  if (typeof candidate.name !== "string" || candidate.name.trim().length === 0) {
    issues.push("missing_name");
  }

  if (
    candidate.movementPattern === null ||
    typeof candidate.movementPattern !== "object" ||
    typeof candidate.movementPattern.code !== "string" ||
    !(MOVEMENT_PATTERN_CODES as readonly string[]).includes(
      candidate.movementPattern.code,
    )
  ) {
    issues.push("invalid_movement_pattern");
  }

  if (!Array.isArray(candidate.primaryMuscles) || candidate.primaryMuscles.length === 0) {
    issues.push("invalid_primary_muscles");
  } else {
    for (const muscle of candidate.primaryMuscles) {
      if (
        muscle === null ||
        typeof muscle !== "object" ||
        typeof muscle.code !== "string" ||
        !(PRIMARY_MUSCLE_GROUP_CODES as readonly string[]).includes(muscle.code)
      ) {
        issues.push("invalid_primary_muscles");
        break;
      }
    }
  }

  if (!Array.isArray(candidate.secondaryMuscles)) {
    issues.push("invalid_secondary_muscles");
  } else {
    for (const muscle of candidate.secondaryMuscles) {
      if (
        muscle === null ||
        typeof muscle !== "object" ||
        typeof muscle.code !== "string" ||
        !(PRIMARY_MUSCLE_GROUP_CODES as readonly string[]).includes(muscle.code)
      ) {
        issues.push("invalid_secondary_muscles");
        break;
      }
    }
  }

  if (!Array.isArray(candidate.equipment) || candidate.equipment.length === 0) {
    issues.push("invalid_equipment");
  } else {
    for (const entry of candidate.equipment) {
      if (
        entry === null ||
        typeof entry !== "object" ||
        typeof entry.equipment !== "string" ||
        !(EQUIPMENT_CODES as readonly string[]).includes(entry.equipment) ||
        typeof entry.required !== "boolean"
      ) {
        issues.push("invalid_equipment");
        break;
      }
    }
  }

  if (
    candidate.difficulty === null ||
    typeof candidate.difficulty !== "object" ||
    typeof candidate.difficulty.level !== "string" ||
    !(EXERCISE_DIFFICULTY_LEVELS as readonly string[]).includes(
      candidate.difficulty.level,
    ) ||
    typeof candidate.difficulty.skillScore !== "number" ||
    !Number.isFinite(candidate.difficulty.skillScore) ||
    candidate.difficulty.skillScore < 0 ||
    candidate.difficulty.skillScore > 10
  ) {
    issues.push("invalid_difficulty");
  }

  if (
    candidate.category === null ||
    typeof candidate.category !== "object" ||
    typeof candidate.category.code !== "string" ||
    !(EXERCISE_CATEGORY_CODES as readonly string[]).includes(
      candidate.category.code,
    ) ||
    typeof candidate.category.pushPullLegs !== "string" ||
    !(PUSH_PULL_LEGS_CODES as readonly string[]).includes(
      candidate.category.pushPullLegs,
    ) ||
    typeof candidate.category.isUnilateral !== "boolean" ||
    typeof candidate.category.isCompound !== "boolean"
  ) {
    issues.push("invalid_category");
  }

  if (
    !Array.isArray(candidate.allowedGoals) ||
    candidate.allowedGoals.length === 0 ||
    candidate.allowedGoals.some(
      (goal) =>
        typeof goal !== "string" ||
        !(ALLOWED_GOAL_CODES as readonly string[]).includes(goal),
    )
  ) {
    issues.push("invalid_allowed_goals");
  }

  if (
    !Array.isArray(candidate.allowedTrainingStyles) ||
    candidate.allowedTrainingStyles.length === 0 ||
    candidate.allowedTrainingStyles.some(
      (style) =>
        typeof style !== "string" ||
        !(ALLOWED_TRAINING_STYLE_CODES as readonly string[]).includes(style),
    )
  ) {
    issues.push("invalid_allowed_training_styles");
  }

  if (
    typeof candidate.fatigueScore !== "number" ||
    !Number.isFinite(candidate.fatigueScore) ||
    candidate.fatigueScore < 0 ||
    candidate.fatigueScore > 10
  ) {
    issues.push("invalid_fatigue_score");
  }

  if (
    typeof candidate.jointStress !== "number" ||
    !Number.isFinite(candidate.jointStress) ||
    candidate.jointStress < 0 ||
    candidate.jointStress > 10
  ) {
    issues.push("invalid_joint_stress");
  }

  if (typeof candidate.axialLoading !== "boolean") {
    issues.push("invalid_axial_loading");
  }

  if (!Array.isArray(candidate.variants)) {
    issues.push("invalid_variants");
  } else {
    for (const variant of candidate.variants) {
      if (
        variant === null ||
        typeof variant !== "object" ||
        typeof variant.id !== "string" ||
        variant.id.trim().length === 0 ||
        typeof variant.name !== "string" ||
        variant.name.trim().length === 0 ||
        (variant.noteCode !== null && typeof variant.noteCode !== "string")
      ) {
        issues.push("invalid_variants");
        break;
      }
    }
  }

  if (validateConstraints(candidate.constraints).length > 0) {
    issues.push("invalid_constraints");
  }

  if (
    !Array.isArray(candidate.contraindications) ||
    candidate.contraindications.some(
      (code) => typeof code !== "string" || code.trim().length === 0,
    )
  ) {
    issues.push("invalid_contraindications");
  }

  if (validateRelationships(candidate.relationships).length > 0) {
    issues.push("invalid_relationships");
  }

  if (validateMetadata(candidate.metadata).length > 0) {
    issues.push("invalid_metadata");
  }

  return Object.freeze([...new Set(issues)]);
}
