import type { ExerciseMetadata } from "../models/ExerciseMetadata";
import { EXERCISE_KNOWLEDGE_SOURCES } from "../models/ExerciseMetadata";
import { EXERCISE_TAG_CODES } from "../models/ExerciseTag";

export type MetadataValidationCode =
  | "missing_metadata_version"
  | "invalid_metadata_source"
  | "missing_metadata_created_at"
  | "missing_metadata_updated_at"
  | "invalid_metadata_tags";

/**
 * Validate ExerciseMetadata structural contract.
 */
export function validateMetadata(
  metadata: unknown,
): readonly MetadataValidationCode[] {
  const issues: MetadataValidationCode[] = [];

  if (metadata === null || typeof metadata !== "object") {
    return Object.freeze([
      "missing_metadata_version",
      "invalid_metadata_source",
      "missing_metadata_created_at",
      "missing_metadata_updated_at",
      "invalid_metadata_tags",
    ]);
  }

  const candidate = metadata as Partial<ExerciseMetadata>;

  if (
    typeof candidate.version !== "string" ||
    candidate.version.trim().length === 0
  ) {
    issues.push("missing_metadata_version");
  }

  if (
    typeof candidate.source !== "string" ||
    !(EXERCISE_KNOWLEDGE_SOURCES as readonly string[]).includes(candidate.source)
  ) {
    issues.push("invalid_metadata_source");
  }

  if (
    typeof candidate.createdAt !== "string" ||
    candidate.createdAt.trim().length === 0
  ) {
    issues.push("missing_metadata_created_at");
  }

  if (
    typeof candidate.updatedAt !== "string" ||
    candidate.updatedAt.trim().length === 0
  ) {
    issues.push("missing_metadata_updated_at");
  }

  if (!Array.isArray(candidate.tags)) {
    issues.push("invalid_metadata_tags");
  } else {
    for (const tag of candidate.tags) {
      if (
        tag === null ||
        typeof tag !== "object" ||
        typeof tag.code !== "string" ||
        !(EXERCISE_TAG_CODES as readonly string[]).includes(tag.code)
      ) {
        issues.push("invalid_metadata_tags");
        break;
      }
    }
  }

  return Object.freeze([...new Set(issues)]);
}
