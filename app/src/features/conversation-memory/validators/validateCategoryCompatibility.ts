import { ALL_MEMORY_CATEGORIES } from "../models/MemoryCategory";
import type { MemoryCategory } from "../models/MemoryCategory";
import type {
  MemoryValidation,
  MemoryValidationIssue,
} from "../models/MemoryValidation";
import { MemoryValidationCodes } from "../models/MemoryValidation";
import {
  isContextCategory,
  isDecisionCategory,
  isProfileCategory,
  resolveMemoryLane,
  type MemoryLane,
} from "../utils/categoryHelpers";
import { freezeValidation } from "../utils/FreezeMemoryState";

/**
 * Validates category / lane compatibility.
 */
export function validateCategoryCompatibility(
  category: MemoryCategory | null | undefined,
  expectedLane?: MemoryLane | null,
): MemoryValidation {
  const issues: MemoryValidationIssue[] = [];

  if (!category) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_CATEGORY,
        message: "Memory category is required.",
        path: "category",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!(ALL_MEMORY_CATEGORIES as readonly string[]).includes(category)) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_CATEGORY,
        message: "Unknown memory category.",
        path: "category",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  const lane = resolveMemoryLane(category);
  const laneOk =
    (lane === "profile" && isProfileCategory(category)) ||
    (lane === "context" && isContextCategory(category)) ||
    (lane === "decision" && isDecisionCategory(category));

  if (!laneOk) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.CATEGORY_INCOMPATIBLE,
        message: "Category is not compatible with any memory lane.",
        path: "category",
      }),
    );
  }

  if (expectedLane && lane !== expectedLane) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.CATEGORY_INCOMPATIBLE,
        message: `Category lane '${lane}' does not match expected '${expectedLane}'.`,
        path: "category",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
