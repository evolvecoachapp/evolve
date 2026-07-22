import type { Achievement } from "../models/Achievement";
import { achievementIdentity } from "../utils/normalizeOutput";

/**
 * Detect duplicate achievements within a candidate list.
 */
export function validateDuplicates(
  achievements: readonly Achievement[],
): readonly string[] {
  const seen = new Set<string>();
  const issues: string[] = [];

  for (const achievement of achievements) {
    const key = achievementIdentity(achievement);
    if (seen.has(key)) {
      issues.push(`duplicate_achievement:${key}`);
      continue;
    }
    seen.add(key);
  }

  return Object.freeze(issues);
}
