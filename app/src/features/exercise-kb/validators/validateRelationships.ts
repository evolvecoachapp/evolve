import type { ExerciseRelationship } from "../models/ExerciseRelationship";
import { EXERCISE_RELATIONSHIP_KINDS } from "../models/ExerciseRelationship";

export type RelationshipsValidationCode =
  | "invalid_relationships"
  | "invalid_relationship_kind"
  | "missing_target_exercise_id"
  | "invalid_relationship_strength";

/**
 * Validate an array of ExerciseRelationship edges.
 */
export function validateRelationships(
  relationships: unknown,
): readonly RelationshipsValidationCode[] {
  const issues: RelationshipsValidationCode[] = [];

  if (!Array.isArray(relationships)) {
    return Object.freeze(["invalid_relationships"]);
  }

  for (const entry of relationships) {
    if (entry === null || typeof entry !== "object") {
      issues.push("invalid_relationships");
      continue;
    }

    const relationship = entry as Partial<ExerciseRelationship>;

    if (
      typeof relationship.kind !== "string" ||
      !(EXERCISE_RELATIONSHIP_KINDS as readonly string[]).includes(
        relationship.kind,
      )
    ) {
      issues.push("invalid_relationship_kind");
    }

    if (
      typeof relationship.targetExerciseId !== "string" ||
      relationship.targetExerciseId.trim().length === 0
    ) {
      issues.push("missing_target_exercise_id");
    }

    if (
      typeof relationship.strength !== "number" ||
      !Number.isFinite(relationship.strength) ||
      relationship.strength < 0 ||
      relationship.strength > 1
    ) {
      issues.push("invalid_relationship_strength");
    }
  }

  return Object.freeze([...new Set(issues)]);
}
