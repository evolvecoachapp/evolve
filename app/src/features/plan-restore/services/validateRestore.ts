import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";
import type { PlanType } from "../../plan-history/models/PlanType";
import type { PlanRestoreValidation } from "../models/PlanRestoreValidation";
import {
  RestoreConflictCodes,
  type RestoreConflict,
} from "../models/RestoreConflict";

function conflict(
  code: RestoreConflict["code"],
  message: string,
  field: string | null = null,
): RestoreConflict {
  return Object.freeze({ code, message, field });
}

/**
 * Validate that a resolved snapshot is safe to restore.
 * Never restores corrupted snapshots.
 */
export function validateRestore(input: {
  readonly history: PlanHistory | null;
  readonly snapshot: PlanSnapshot | null;
  readonly expectedPlanType: PlanType;
  readonly historyService: PlanHistoryService;
}): {
  readonly validation: PlanRestoreValidation;
  readonly conflicts: readonly RestoreConflict[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const conflicts: RestoreConflict[] = [];

  const snapshotExists = input.snapshot !== null;
  if (!snapshotExists) {
    errors.push("Snapshot does not exist");
    conflicts.push(
      conflict(
        RestoreConflictCodes.TARGET_NOT_FOUND,
        "Snapshot does not exist",
        "snapshot",
      ),
    );
  }

  const targetVersionExists =
    snapshotExists &&
    input.history !== null &&
    input.history.snapshots.some(
      (item) => item.id === input.snapshot!.id,
    );
  if (snapshotExists && !targetVersionExists) {
    errors.push("Target version is not present in lineage history");
    conflicts.push(
      conflict(
        RestoreConflictCodes.HISTORY_INCONSISTENT,
        "Target version missing from history",
        "history",
      ),
    );
  }

  let snapshotIntegrity = false;
  if (input.snapshot) {
    if (input.snapshot.corrupted) {
      errors.push("Snapshot is marked corrupted");
      conflicts.push(
        conflict(
          RestoreConflictCodes.SNAPSHOT_CORRUPTED,
          "Never restore corrupted snapshots",
          "snapshot",
        ),
      );
    } else {
      snapshotIntegrity = input.historyService.validateSnapshotIntegrity(
        input.snapshot,
      );
      if (!snapshotIntegrity) {
        errors.push("Snapshot integrity checksum failed");
        conflicts.push(
          conflict(
            RestoreConflictCodes.INTEGRITY_FAILED,
            "Snapshot integrity check failed",
            "checksum",
          ),
        );
      }
    }
  }

  const compatiblePlanType =
    input.snapshot !== null &&
    input.snapshot.version.planType === input.expectedPlanType;
  if (input.snapshot && !compatiblePlanType) {
    errors.push(
      `Incompatible plan type: expected ${input.expectedPlanType}, got ${input.snapshot.version.planType}`,
    );
    conflicts.push(
      conflict(
        RestoreConflictCodes.INCOMPATIBLE_PLAN_TYPE,
        "Plan type mismatch",
        "planType",
      ),
    );
  }

  let historyConsistency = input.history !== null;
  if (input.history) {
    const sequential = input.history.versions.every(
      (version, index) => version.versionNumber === index + 1,
    );
    const countsMatch =
      input.history.versions.length === input.history.snapshots.length &&
      input.history.currentVersionNumber === input.history.versions.length;
    if (!sequential || !countsMatch) {
      historyConsistency = false;
      errors.push("History version sequence is inconsistent");
      conflicts.push(
        conflict(
          RestoreConflictCodes.HISTORY_INCONSISTENT,
          "History consistency check failed",
          "history",
        ),
      );
    }
  } else {
    errors.push("Plan history is missing");
    conflicts.push(
      conflict(
        RestoreConflictCodes.HISTORY_NOT_FOUND,
        "Plan history is missing",
        "history",
      ),
    );
  }

  if (
    input.snapshot?.version.planType === "workout" &&
    !input.snapshot.workoutPlan
  ) {
    errors.push("Workout snapshot payload missing");
    conflicts.push(
      conflict(
        RestoreConflictCodes.MISSING_PLAN_PAYLOAD,
        "Workout plan payload missing",
        "workoutPlan",
      ),
    );
  }
  if (
    input.snapshot?.version.planType === "nutrition" &&
    !input.snapshot.nutritionPlan
  ) {
    errors.push("Nutrition snapshot payload missing");
    conflicts.push(
      conflict(
        RestoreConflictCodes.MISSING_PLAN_PAYLOAD,
        "Nutrition plan payload missing",
        "nutritionPlan",
      ),
    );
  }

  const valid =
    snapshotExists &&
    snapshotIntegrity &&
    compatiblePlanType &&
    historyConsistency &&
    targetVersionExists &&
    errors.length === 0;

  if (!valid && conflicts.length === 0) {
    conflicts.push(
      conflict(
        RestoreConflictCodes.VALIDATION_FAILED,
        "Restore validation failed",
        null,
      ),
    );
  }

  return Object.freeze({
    validation: Object.freeze({
      valid,
      snapshotExists,
      snapshotIntegrity,
      compatiblePlanType,
      historyConsistency,
      targetVersionExists,
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
    }),
    conflicts: Object.freeze(conflicts),
  });
}
