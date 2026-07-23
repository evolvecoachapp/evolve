import type { MemorySnapshot } from "../models/MemorySnapshot";
import type {
  MemoryValidation,
  MemoryValidationIssue,
} from "../models/MemoryValidation";
import { MemoryValidationCodes } from "../models/MemoryValidation";
import { freezeValidation } from "../utils/FreezeMemoryState";

/**
 * Validates snapshot integrity.
 */
export function validateMemorySnapshot(
  snapshot: MemorySnapshot | null | undefined,
): MemoryValidation {
  const issues: MemoryValidationIssue[] = [];

  if (!snapshot) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.SNAPSHOT_INTEGRITY,
        message: "Memory snapshot is required.",
        path: "snapshot",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!snapshot.id) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Snapshot id is required.",
        path: "snapshot.id",
      }),
    );
  }

  if (!Array.isArray(snapshot.entries)) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.SNAPSHOT_INTEGRITY,
        message: "Snapshot entries must be an array.",
        path: "snapshot.entries",
      }),
    );
  } else if (snapshot.entryCount !== snapshot.entries.length) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.SNAPSHOT_INTEGRITY,
        message: "Snapshot entryCount does not match entries length.",
        path: "snapshot.entryCount",
      }),
    );
  }

  if (!snapshot.profile || !snapshot.context || !snapshot.decision) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.SNAPSHOT_INTEGRITY,
        message: "Snapshot must include profile, context, and decision lanes.",
        path: "snapshot.lanes",
      }),
    );
  }

  if (!snapshot.createdAt || !snapshot.frozenAt) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Snapshot timestamps are required.",
        path: "snapshot.createdAt",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
