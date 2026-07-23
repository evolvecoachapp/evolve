import { ALL_MEMORY_CATEGORIES } from "../models/MemoryCategory";
import type { MemoryEntry } from "../models/MemoryEntry";
import { ALL_MEMORY_PRIORITIES } from "../models/MemoryPriority";
import { ALL_MEMORY_SCOPES } from "../models/MemoryScope";
import type {
  MemoryValidation,
  MemoryValidationIssue,
} from "../models/MemoryValidation";
import { MemoryValidationCodes } from "../models/MemoryValidation";
import { freezeValidation } from "../utils/FreezeMemoryState";

/**
 * Validates memory entry shape (orchestration integrity only).
 */
export function validateMemoryEntry(
  entry: MemoryEntry | null | undefined,
): MemoryValidation {
  const issues: MemoryValidationIssue[] = [];

  if (!entry) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Memory entry is required.",
        path: "entry",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!entry.id) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Entry id is required.",
        path: "entry.id",
      }),
    );
  }

  if (!entry.key || entry.key.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Entry key is required.",
        path: "entry.key",
      }),
    );
  }

  if (entry.value == null || String(entry.value).trim().length === 0) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Entry value is required.",
        path: "entry.value",
      }),
    );
  }

  if (!(ALL_MEMORY_CATEGORIES as readonly string[]).includes(entry.category)) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_CATEGORY,
        message: "Entry category is invalid.",
        path: "entry.category",
      }),
    );
  }

  if (!(ALL_MEMORY_SCOPES as readonly string[]).includes(entry.scope)) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_VALUE,
        message: "Entry scope is invalid.",
        path: "entry.scope",
      }),
    );
  }

  if (!(ALL_MEMORY_PRIORITIES as readonly number[]).includes(entry.priority)) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_VALUE,
        message: "Entry priority is invalid.",
        path: "entry.priority",
      }),
    );
  }

  if (!entry.createdAt) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Entry createdAt is required.",
        path: "entry.createdAt",
      }),
    );
  }

  if (!entry.updatedAt) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Entry updatedAt is required.",
        path: "entry.updatedAt",
      }),
    );
  }

  if (entry.version < 1) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_VALUE,
        message: "Entry version must be >= 1.",
        path: "entry.version",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
