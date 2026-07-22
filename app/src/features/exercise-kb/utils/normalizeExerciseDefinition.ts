import type { AllowedGoalCode, AllowedTrainingStyleCode, ExerciseDefinition } from "../models/ExerciseDefinition";
import {
  ALLOWED_GOAL_CODES,
  ALLOWED_TRAINING_STYLE_CODES,
} from "../models/ExerciseDefinition";
import type {
  ExerciseCategory,
  ExerciseCategoryCode,
  PushPullLegsCode,
} from "../models/ExerciseCategory";
import {
  EXERCISE_CATEGORY_CODES,
  PUSH_PULL_LEGS_CODES,
} from "../models/ExerciseCategory";
import type { ExerciseConstraint } from "../models/ExerciseConstraint";
import {
  EXERCISE_CONSTRAINT_KINDS,
  EXERCISE_CONSTRAINT_SEVERITIES,
} from "../models/ExerciseConstraint";
import type {
  ExerciseDifficulty,
  ExerciseDifficultyLevel,
} from "../models/ExerciseDifficulty";
import { EXERCISE_DIFFICULTY_LEVELS } from "../models/ExerciseDifficulty";
import type {
  EquipmentCode,
  EquipmentRequirement,
} from "../models/EquipmentRequirement";
import { EQUIPMENT_CODES } from "../models/EquipmentRequirement";
import type {
  ExerciseKnowledgeSource,
  ExerciseMetadata,
} from "../models/ExerciseMetadata";
import { EXERCISE_KNOWLEDGE_SOURCES } from "../models/ExerciseMetadata";
import type {
  ExerciseRelationship,
  ExerciseRelationshipKind,
} from "../models/ExerciseRelationship";
import { EXERCISE_RELATIONSHIP_KINDS } from "../models/ExerciseRelationship";
import type { ExerciseTag, ExerciseTagCode } from "../models/ExerciseTag";
import { EXERCISE_TAG_CODES } from "../models/ExerciseTag";
import type { ExerciseVariant } from "../models/ExerciseVariant";
import type {
  MovementPattern,
  MovementPatternCode,
} from "../models/MovementPattern";
import { MOVEMENT_PATTERN_CODES } from "../models/MovementPattern";
import type {
  PrimaryMuscleGroup,
  PrimaryMuscleGroupCode,
} from "../models/PrimaryMuscleGroup";
import { PRIMARY_MUSCLE_GROUP_CODES } from "../models/PrimaryMuscleGroup";
import type { SecondaryMuscleGroup } from "../models/SecondaryMuscleGroup";
import { freezeExerciseDefinition } from "./freezeExerciseDefinition";

export interface NormalizeExerciseDefinitionOptions {
  readonly id?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly source?: ExerciseKnowledgeSource;
}

/**
 * Normalize a partial/raw definition into a complete ExerciseDefinition.
 * Fills defaults for missing fields. Does not validate.
 */
export function normalizeExerciseDefinition(
  input: unknown,
  options: NormalizeExerciseDefinitionOptions = {},
): ExerciseDefinition {
  const raw =
    input !== null && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const definition: ExerciseDefinition = {
    id:
      typeof options.id === "string" && options.id.trim().length > 0
        ? options.id.trim()
        : typeof raw.id === "string" && raw.id.trim().length > 0
          ? raw.id.trim()
          : createId("ex"),
    name:
      typeof raw.name === "string" && raw.name.trim().length > 0
        ? raw.name.trim()
        : "Unnamed Exercise",
    movementPattern: normalizeMovementPattern(raw.movementPattern),
    primaryMuscles: normalizePrimaryMuscles(raw.primaryMuscles),
    secondaryMuscles: normalizeSecondaryMuscles(raw.secondaryMuscles),
    equipment: normalizeEquipment(raw.equipment),
    difficulty: normalizeDifficulty(raw.difficulty),
    category: normalizeCategory(raw.category),
    allowedGoals: normalizeAllowedGoals(raw.allowedGoals),
    allowedTrainingStyles: normalizeAllowedTrainingStyles(
      raw.allowedTrainingStyles,
    ),
    fatigueScore: normalizeScore(raw.fatigueScore, 5),
    jointStress: normalizeScore(raw.jointStress, 5),
    axialLoading: raw.axialLoading === true,
    variants: normalizeVariants(raw.variants),
    constraints: normalizeConstraints(raw.constraints),
    contraindications: normalizeStringList(raw.contraindications),
    relationships: normalizeRelationships(raw.relationships),
    metadata: normalizeMetadata(raw.metadata, options),
  };

  return freezeExerciseDefinition(definition);
}

function normalizeMovementPattern(value: unknown): MovementPattern {
  if (typeof value === "string" && isMovementPatternCode(value)) {
    return { code: value };
  }
  if (value !== null && typeof value === "object") {
    const raw = value as Record<string, unknown>;
    if (typeof raw.code === "string" && isMovementPatternCode(raw.code)) {
      return { code: raw.code };
    }
  }
  return { code: "other" };
}

function normalizePrimaryMuscles(value: unknown): readonly PrimaryMuscleGroup[] {
  const muscles = normalizeMuscleList(value);
  return muscles.length > 0 ? muscles : [{ code: "core" }];
}

function normalizeSecondaryMuscles(
  value: unknown,
): readonly SecondaryMuscleGroup[] {
  return normalizeMuscleList(value);
}

function normalizeMuscleList(value: unknown): PrimaryMuscleGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const muscles: PrimaryMuscleGroup[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && isMuscleCode(entry)) {
      muscles.push({ code: entry });
      continue;
    }
    if (entry !== null && typeof entry === "object") {
      const raw = entry as Record<string, unknown>;
      if (typeof raw.code === "string" && isMuscleCode(raw.code)) {
        muscles.push({ code: raw.code });
      }
    }
  }
  return muscles;
}

function normalizeEquipment(value: unknown): readonly EquipmentRequirement[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [{ equipment: "other", required: true }];
  }
  const equipment: EquipmentRequirement[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && isEquipmentCode(entry)) {
      equipment.push({ equipment: entry, required: true });
      continue;
    }
    if (entry !== null && typeof entry === "object") {
      const raw = entry as Record<string, unknown>;
      if (typeof raw.equipment === "string" && isEquipmentCode(raw.equipment)) {
        equipment.push({
          equipment: raw.equipment,
          required: raw.required !== false,
        });
      }
    }
  }
  return equipment.length > 0
    ? equipment
    : [{ equipment: "other", required: true }];
}

function normalizeDifficulty(value: unknown): ExerciseDifficulty {
  const raw =
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const level =
    typeof raw.level === "string" &&
    (EXERCISE_DIFFICULTY_LEVELS as readonly string[]).includes(raw.level)
      ? (raw.level as ExerciseDifficultyLevel)
      : "intermediate";

  return {
    level,
    skillScore: normalizeScore(raw.skillScore, defaultSkillForLevel(level)),
  };
}

function normalizeCategory(value: unknown): ExerciseCategory {
  const raw =
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const code =
    typeof raw.code === "string" &&
    (EXERCISE_CATEGORY_CODES as readonly string[]).includes(raw.code)
      ? (raw.code as ExerciseCategoryCode)
      : "compound";

  const pushPullLegs =
    typeof raw.pushPullLegs === "string" &&
    (PUSH_PULL_LEGS_CODES as readonly string[]).includes(raw.pushPullLegs)
      ? (raw.pushPullLegs as PushPullLegsCode)
      : "other";

  return {
    code,
    pushPullLegs,
    isUnilateral: raw.isUnilateral === true,
    isCompound: raw.isCompound !== false && code === "compound",
  };
}

function normalizeAllowedGoals(value: unknown): readonly AllowedGoalCode[] {
  if (!Array.isArray(value)) {
    return ["general_fitness"];
  }
  const goals = value.filter(
    (entry): entry is AllowedGoalCode =>
      typeof entry === "string" &&
      (ALLOWED_GOAL_CODES as readonly string[]).includes(entry),
  );
  return goals.length > 0 ? goals : ["general_fitness"];
}

function normalizeAllowedTrainingStyles(
  value: unknown,
): readonly AllowedTrainingStyleCode[] {
  if (!Array.isArray(value)) {
    return ["general"];
  }
  const styles = value.filter(
    (entry): entry is AllowedTrainingStyleCode =>
      typeof entry === "string" &&
      (ALLOWED_TRAINING_STYLE_CODES as readonly string[]).includes(entry),
  );
  return styles.length > 0 ? styles : ["general"];
}

function normalizeVariants(value: unknown): readonly ExerciseVariant[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const variants: ExerciseVariant[] = [];
  value.forEach((entry, index) => {
    if (entry === null || typeof entry !== "object") {
      return;
    }
    const raw = entry as Record<string, unknown>;
    variants.push({
      id:
        typeof raw.id === "string" && raw.id.trim().length > 0
          ? raw.id.trim()
          : `variant-${index + 1}`,
      name:
        typeof raw.name === "string" && raw.name.trim().length > 0
          ? raw.name.trim()
          : `Variant ${index + 1}`,
      noteCode:
        raw.noteCode === null || raw.noteCode === undefined
          ? null
          : typeof raw.noteCode === "string"
            ? raw.noteCode
            : null,
    });
  });
  return variants;
}

function normalizeConstraints(value: unknown): readonly ExerciseConstraint[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const constraints: ExerciseConstraint[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object") {
      continue;
    }
    const raw = entry as Record<string, unknown>;
    if (
      typeof raw.kind !== "string" ||
      !(EXERCISE_CONSTRAINT_KINDS as readonly string[]).includes(raw.kind) ||
      typeof raw.code !== "string" ||
      raw.code.trim().length === 0 ||
      typeof raw.severity !== "string" ||
      !(EXERCISE_CONSTRAINT_SEVERITIES as readonly string[]).includes(
        raw.severity,
      )
    ) {
      continue;
    }
    constraints.push({
      kind: raw.kind as ExerciseConstraint["kind"],
      code: raw.code.trim(),
      severity: raw.severity as ExerciseConstraint["severity"],
    });
  }
  return constraints;
}

function normalizeRelationships(
  value: unknown,
): readonly ExerciseRelationship[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const relationships: ExerciseRelationship[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object") {
      continue;
    }
    const raw = entry as Record<string, unknown>;
    if (
      typeof raw.kind !== "string" ||
      !(EXERCISE_RELATIONSHIP_KINDS as readonly string[]).includes(raw.kind) ||
      typeof raw.targetExerciseId !== "string" ||
      raw.targetExerciseId.trim().length === 0
    ) {
      continue;
    }
    relationships.push({
      kind: raw.kind as ExerciseRelationshipKind,
      targetExerciseId: raw.targetExerciseId.trim(),
      strength: normalizeUnitInterval(raw.strength, 0.5),
    });
  }
  return relationships;
}

function normalizeMetadata(
  value: unknown,
  options: NormalizeExerciseDefinitionOptions,
): ExerciseMetadata {
  const raw =
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const now = new Date().toISOString();
  const source =
    typeof raw.source === "string" &&
    (EXERCISE_KNOWLEDGE_SOURCES as readonly string[]).includes(raw.source)
      ? (raw.source as ExerciseKnowledgeSource)
      : (options.source ?? "catalog");

  return {
    version:
      typeof raw.version === "string" && raw.version.trim().length > 0
        ? raw.version.trim()
        : "1.0.0",
    source,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.trim().length > 0
        ? raw.createdAt
        : (options.createdAt ?? now),
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim().length > 0
        ? raw.updatedAt
        : (options.updatedAt ?? options.createdAt ?? now),
    tags: normalizeTags(raw.tags),
  };
}

function normalizeTags(value: unknown): readonly ExerciseTag[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const tags: ExerciseTag[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && isTagCode(entry)) {
      tags.push({ code: entry });
      continue;
    }
    if (entry !== null && typeof entry === "object") {
      const raw = entry as Record<string, unknown>;
      if (typeof raw.code === "string" && isTagCode(raw.code)) {
        tags.push({ code: raw.code });
      }
    }
  }
  return tags;
}

function normalizeStringList(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );
}

function normalizeScore(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(10, Math.max(0, value));
  }
  return fallback;
}

function normalizeUnitInterval(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }
  return fallback;
}

function defaultSkillForLevel(level: ExerciseDifficultyLevel): number {
  switch (level) {
    case "beginner":
      return 2;
    case "intermediate":
      return 5;
    case "advanced":
      return 7;
    case "expert":
      return 9;
  }
}

function isMovementPatternCode(value: string): value is MovementPatternCode {
  return (MOVEMENT_PATTERN_CODES as readonly string[]).includes(value);
}

function isMuscleCode(value: string): value is PrimaryMuscleGroupCode {
  return (PRIMARY_MUSCLE_GROUP_CODES as readonly string[]).includes(value);
}

function isEquipmentCode(value: string): value is EquipmentCode {
  return (EQUIPMENT_CODES as readonly string[]).includes(value);
}

function isTagCode(value: string): value is ExerciseTagCode {
  return (EXERCISE_TAG_CODES as readonly string[]).includes(value);
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
