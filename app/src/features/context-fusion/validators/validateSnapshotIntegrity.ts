import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { ContextValidation } from "../models/ContextValidation";

export function validateSnapshotIntegrity(
  snapshot: ContextSnapshot,
): ContextValidation {
  const issues = [];
  if (!snapshot.id) {
    issues.push({
      code: ContextIntegrityCodes.SNAPSHOT_INVALID,
      message: "Snapshot id is required.",
      path: "id",
    });
  }
  if (snapshot.contextId !== snapshot.context.id) {
    issues.push({
      code: ContextIntegrityCodes.SNAPSHOT_INVALID,
      message: "Snapshot contextId must match context.id.",
      path: "contextId",
    });
  }
  if (snapshot.athleteId !== snapshot.context.athleteId) {
    issues.push({
      code: ContextIntegrityCodes.SNAPSHOT_INVALID,
      message: "Snapshot athleteId must match context.athleteId.",
      path: "athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
