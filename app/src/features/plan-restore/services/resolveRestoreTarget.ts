import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";
import {
  RestoreConflictCodes,
  type RestoreConflict,
} from "../models/RestoreConflict";
import {
  PlanRestoreTargetKinds,
  type PlanRestoreTarget,
} from "../models/PlanRestoreTarget";

export interface ResolveRestoreTargetResult {
  readonly success: boolean;
  readonly snapshot: PlanSnapshot | null;
  readonly conflicts: readonly RestoreConflict[];
}

function conflict(
  code: RestoreConflict["code"],
  message: string,
  field: string | null = null,
): RestoreConflict {
  return Object.freeze({ code, message, field });
}

function findByTimestamp(
  history: PlanHistory,
  timestamp: string,
): PlanSnapshot | null {
  const targetMs = Date.parse(timestamp);
  if (Number.isNaN(targetMs)) return null;

  let best: PlanSnapshot | null = null;
  for (const snapshot of history.snapshots) {
    const publishedMs = Date.parse(snapshot.version.publishedAt);
    if (Number.isNaN(publishedMs)) continue;
    if (publishedMs > targetMs) continue;
    if (
      !best ||
      Date.parse(best.version.publishedAt) < publishedMs
    ) {
      best = snapshot;
    }
  }
  return best;
}

/**
 * Resolve a restore target against immutable plan history.
 * Unknown / unresolved targets return deterministic conflicts.
 */
export function resolveRestoreTarget(input: {
  readonly history: PlanHistory | null;
  readonly target: PlanRestoreTarget;
}): ResolveRestoreTargetResult {
  const { history, target } = input;

  if (!history) {
    return Object.freeze({
      success: false,
      snapshot: null,
      conflicts: Object.freeze([
        conflict(
          RestoreConflictCodes.HISTORY_NOT_FOUND,
          `No plan history for lineage ${target.lineageId}`,
          "lineageId",
        ),
      ]),
    });
  }

  if (history.planType !== target.planType) {
    return Object.freeze({
      success: false,
      snapshot: null,
      conflicts: Object.freeze([
        conflict(
          RestoreConflictCodes.INCOMPATIBLE_PLAN_TYPE,
          `History is ${history.planType}; target requested ${target.planType}`,
          "planType",
        ),
      ]),
    });
  }

  let snapshot: PlanSnapshot | null = null;
  const conflicts: RestoreConflict[] = [];

  switch (target.kind) {
    case PlanRestoreTargetKinds.LAST_VERSION: {
      snapshot =
        history.snapshots.find(
          (item) =>
            item.version.versionNumber === history.currentVersionNumber,
        ) ?? null;
      break;
    }
    case PlanRestoreTargetKinds.PREVIOUS_VERSION: {
      const previous = history.currentVersionNumber - 1;
      if (previous < 1) {
        conflicts.push(
          conflict(
            RestoreConflictCodes.NO_PREVIOUS_VERSION,
            "No previous version exists to restore",
            "versionNumber",
          ),
        );
      } else {
        snapshot =
          history.snapshots.find(
            (item) => item.version.versionNumber === previous,
          ) ?? null;
      }
      break;
    }
    case PlanRestoreTargetKinds.INITIAL_VERSION: {
      snapshot =
        history.snapshots.find((item) => item.version.versionNumber === 1) ??
        null;
      break;
    }
    case PlanRestoreTargetKinds.VERSION_NUMBER: {
      if (target.versionNumber === null || target.versionNumber < 1) {
        conflicts.push(
          conflict(
            RestoreConflictCodes.UNKNOWN_TARGET,
            "VERSION_NUMBER target requires a positive versionNumber",
            "versionNumber",
          ),
        );
      } else {
        snapshot =
          history.snapshots.find(
            (item) => item.version.versionNumber === target.versionNumber,
          ) ?? null;
      }
      break;
    }
    case PlanRestoreTargetKinds.TIMESTAMP: {
      if (!target.timestamp) {
        conflicts.push(
          conflict(
            RestoreConflictCodes.UNKNOWN_TARGET,
            "TIMESTAMP target requires timestamp",
            "timestamp",
          ),
        );
      } else {
        snapshot = findByTimestamp(history, target.timestamp);
      }
      break;
    }
    case PlanRestoreTargetKinds.CHANGE_REASON: {
      if (!target.changeReason) {
        conflicts.push(
          conflict(
            RestoreConflictCodes.UNKNOWN_TARGET,
            "CHANGE_REASON target requires changeReason",
            "changeReason",
          ),
        );
      } else {
        const matches = history.snapshots.filter(
          (item) => item.version.changeReason === target.changeReason,
        );
        snapshot = matches.length > 0 ? matches[matches.length - 1]! : null;
      }
      break;
    }
    case PlanRestoreTargetKinds.MANUAL_SELECTION: {
      if (!target.snapshotId) {
        conflicts.push(
          conflict(
            RestoreConflictCodes.UNKNOWN_TARGET,
            "MANUAL_SELECTION target requires snapshotId",
            "snapshotId",
          ),
        );
      } else {
        snapshot =
          history.snapshots.find((item) => item.id === target.snapshotId) ??
          null;
      }
      break;
    }
    default: {
      conflicts.push(
        conflict(
          RestoreConflictCodes.UNKNOWN_TARGET,
          `Unknown restore target kind`,
          "kind",
        ),
      );
    }
  }

  if (conflicts.length > 0) {
    return Object.freeze({
      success: false,
      snapshot: null,
      conflicts: Object.freeze(conflicts),
    });
  }

  if (!snapshot) {
    return Object.freeze({
      success: false,
      snapshot: null,
      conflicts: Object.freeze([
        conflict(
          RestoreConflictCodes.TARGET_NOT_FOUND,
          `Could not resolve restore target ${target.kind}`,
          "target",
        ),
      ]),
    });
  }

  return Object.freeze({
    success: true,
    snapshot,
    conflicts: Object.freeze([] as RestoreConflict[]),
  });
}
