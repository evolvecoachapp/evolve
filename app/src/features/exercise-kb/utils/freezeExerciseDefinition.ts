import type { EquipmentRequirement } from "../models/EquipmentRequirement";
import type { ExerciseConstraint } from "../models/ExerciseConstraint";
import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import type { ExerciseMetadata } from "../models/ExerciseMetadata";
import type { ExerciseRelationship } from "../models/ExerciseRelationship";
import type { ExerciseTag } from "../models/ExerciseTag";
import type { ExerciseVariant } from "../models/ExerciseVariant";
import type { PrimaryMuscleGroup } from "../models/PrimaryMuscleGroup";
import type { SecondaryMuscleGroup } from "../models/SecondaryMuscleGroup";

/**
 * Deep-freeze an ExerciseDefinition tree.
 */
export function freezeExerciseDefinition(
  definition: ExerciseDefinition,
): ExerciseDefinition {
  return deepFreeze(cloneDefinition(definition)) as ExerciseDefinition;
}

function cloneDefinition(definition: ExerciseDefinition): ExerciseDefinition {
  return {
    id: definition.id,
    name: definition.name,
    movementPattern: { code: definition.movementPattern.code },
    primaryMuscles: definition.primaryMuscles.map(cloneMuscle),
    secondaryMuscles: definition.secondaryMuscles.map(cloneSecondaryMuscle),
    equipment: definition.equipment.map(cloneEquipment),
    difficulty: {
      level: definition.difficulty.level,
      skillScore: definition.difficulty.skillScore,
    },
    category: {
      code: definition.category.code,
      pushPullLegs: definition.category.pushPullLegs,
      isUnilateral: definition.category.isUnilateral,
      isCompound: definition.category.isCompound,
    },
    allowedGoals: [...definition.allowedGoals],
    allowedTrainingStyles: [...definition.allowedTrainingStyles],
    fatigueScore: definition.fatigueScore,
    jointStress: definition.jointStress,
    axialLoading: definition.axialLoading,
    variants: definition.variants.map(cloneVariant),
    constraints: definition.constraints.map(cloneConstraint),
    contraindications: [...definition.contraindications],
    relationships: definition.relationships.map(cloneRelationship),
    metadata: cloneMetadata(definition.metadata),
  };
}

function cloneMuscle(muscle: PrimaryMuscleGroup): PrimaryMuscleGroup {
  return { code: muscle.code };
}

function cloneSecondaryMuscle(
  muscle: SecondaryMuscleGroup,
): SecondaryMuscleGroup {
  return { code: muscle.code };
}

function cloneEquipment(
  equipment: EquipmentRequirement,
): EquipmentRequirement {
  return {
    equipment: equipment.equipment,
    required: equipment.required,
  };
}

function cloneVariant(variant: ExerciseVariant): ExerciseVariant {
  return {
    id: variant.id,
    name: variant.name,
    noteCode: variant.noteCode,
  };
}

function cloneConstraint(constraint: ExerciseConstraint): ExerciseConstraint {
  return {
    kind: constraint.kind,
    code: constraint.code,
    severity: constraint.severity,
  };
}

function cloneRelationship(
  relationship: ExerciseRelationship,
): ExerciseRelationship {
  return {
    kind: relationship.kind,
    targetExerciseId: relationship.targetExerciseId,
    strength: relationship.strength,
  };
}

function cloneMetadata(metadata: ExerciseMetadata): ExerciseMetadata {
  return {
    version: metadata.version,
    source: metadata.source,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
    tags: metadata.tags.map(cloneTag),
  };
}

function cloneTag(tag: ExerciseTag): ExerciseTag {
  return { code: tag.code };
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const child = record[key];
    if (child !== null && typeof child === "object") {
      deepFreeze(child);
    }
  }

  return Object.freeze(value);
}
