import type { PlanChangeReason } from "../../plan-history/models/PlanChangeReason";
import type { PlanType } from "../../plan-history/models/PlanType";

/**
 * How the restore target version is selected.
 */
export const PlanRestoreTargetKinds = {
  LAST_VERSION: "LAST_VERSION",
  PREVIOUS_VERSION: "PREVIOUS_VERSION",
  INITIAL_VERSION: "INITIAL_VERSION",
  VERSION_NUMBER: "VERSION_NUMBER",
  TIMESTAMP: "TIMESTAMP",
  CHANGE_REASON: "CHANGE_REASON",
  MANUAL_SELECTION: "MANUAL_SELECTION",
} as const;

export type PlanRestoreTargetKind =
  (typeof PlanRestoreTargetKinds)[keyof typeof PlanRestoreTargetKinds];

export const ALL_PLAN_RESTORE_TARGET_KINDS: readonly PlanRestoreTargetKind[] =
  Object.freeze(Object.values(PlanRestoreTargetKinds));

/**
 * Immutable restore target descriptor.
 */
export interface PlanRestoreTarget {
  readonly kind: PlanRestoreTargetKind;
  readonly planType: PlanType;
  readonly lineageId: string;
  readonly versionNumber: number | null;
  readonly timestamp: string | null;
  readonly changeReason: PlanChangeReason | null;
  readonly snapshotId: string | null;
}
