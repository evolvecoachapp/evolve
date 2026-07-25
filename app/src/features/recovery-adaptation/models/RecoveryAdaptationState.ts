import type { RecoveryAdaptation } from "./RecoveryAdaptation";
import type { RecoveryPackage } from "./RecoveryPackage";

export const RecoverySessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type RecoverySessionStatus =
  (typeof RecoverySessionStatuses)[keyof typeof RecoverySessionStatuses];

export interface RecoveryAdaptationState {
  readonly status: RecoverySessionStatus;
  readonly package: RecoveryPackage | null;
  readonly adaptation: RecoveryAdaptation | null;
  readonly updatedAt: string;
}
