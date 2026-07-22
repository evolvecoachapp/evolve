import type { Achievement } from "../models/Achievement";
import type { AchievementMetadata } from "../models/AchievementMetadata";

/**
 * Validate metadata shape and value types.
 */
export function validateMetadata(
  metadata: AchievementMetadata,
): readonly string[] {
  const issues: string[] = [];

  if (!Array.isArray(metadata.tags)) {
    issues.push("metadata_tags_invalid");
  } else if (metadata.tags.some((tag) => typeof tag !== "string")) {
    issues.push("metadata_tags_non_string");
  }

  if (metadata.attributes == null || typeof metadata.attributes !== "object") {
    issues.push("metadata_attributes_invalid");
  } else {
    for (const [key, value] of Object.entries(metadata.attributes)) {
      if (!key) {
        issues.push("metadata_attribute_empty_key");
      }
      const valueType = typeof value;
      if (
        valueType !== "string" &&
        valueType !== "number" &&
        valueType !== "boolean"
      ) {
        issues.push(`metadata_attribute_invalid_type:${key}`);
      }
    }
  }

  return Object.freeze(issues);
}

export function validateAchievementMetadata(
  achievement: Achievement,
): readonly string[] {
  return validateMetadata(achievement.metadata);
}
