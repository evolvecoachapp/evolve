import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import { parseTimestamp } from "../utils/formatting";

/**
 * Validate analysis / freeze timestamps.
 */
export function validateTimestamps(
  context: RecoveryContext,
  frozenAt: string,
): readonly string[] {
  const issues: string[] = [];

  if (parseTimestamp(context.analyzedAt) === null) {
    issues.push("invalid_timestamp:analyzedAt");
  }
  if (parseTimestamp(frozenAt) === null) {
    issues.push("invalid_timestamp:frozenAt");
  }

  return Object.freeze(issues);
}

export function validateSnapshotTimestamps(
  snapshot: RecoverySnapshot,
): readonly string[] {
  return validateTimestamps(snapshot.context, snapshot.frozenAt);
}
