import type { DecisionConflict } from "../models/DecisionConflict";
import type { DecisionResolution } from "../models/DecisionResolution";
import { freezeConflict } from "../utils/FreezeDecisionState";

/**
 * Apply planned resolutions to conflicts — deterministic only.
 */
export function resolveConflicts(input: {
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutions: readonly DecisionResolution[];
}): readonly DecisionConflict[] {
  const resolvedIds = new Set(input.resolutions.map((r) => r.conflictId));
  return Object.freeze(
    input.conflicts.map((c) =>
      freezeConflict({
        ...c,
        resolved: resolvedIds.has(c.id),
      }),
    ),
  );
}
