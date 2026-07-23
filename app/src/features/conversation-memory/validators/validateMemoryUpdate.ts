import type { MemoryUpdate } from "../models/MemoryUpdate";
import type {
  MemoryValidation,
  MemoryValidationIssue,
} from "../models/MemoryValidation";
import { MemoryValidationCodes } from "../models/MemoryValidation";
import { freezeValidation } from "../utils/FreezeMemoryState";

/**
 * Validates memory update payload.
 */
export function validateMemoryUpdate(
  update: MemoryUpdate | null | undefined,
): MemoryValidation {
  const issues: MemoryValidationIssue[] = [];

  if (!update) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.UPDATE_INVALID,
        message: "Memory update is required.",
        path: "update",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!update.id) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Update id is required.",
        path: "update.id",
      }),
    );
  }

  if (!update.entryId) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Update entryId is required.",
        path: "update.entryId",
      }),
    );
  }

  const hasChange =
    update.value != null ||
    update.summary != null ||
    update.priority != null ||
    update.metadata != null;

  if (!hasChange) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.UPDATE_INVALID,
        message: "Update must change at least one field.",
        path: "update",
      }),
    );
  }

  if (
    update.value != null &&
    String(update.value).trim().length === 0
  ) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.INVALID_VALUE,
        message: "Update value must not be empty when provided.",
        path: "update.value",
      }),
    );
  }

  if (!update.createdAt) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Update createdAt is required.",
        path: "update.createdAt",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
