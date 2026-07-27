import type { PlanSnapshot } from "./PlanSnapshot";
import type { PlanType } from "./PlanType";
import type { PlanVersion } from "./PlanVersion";

/**
 * Immutable view of a plan lineage's version history.
 */
export interface PlanHistory {
  readonly lineageId: string;
  readonly planType: PlanType;
  readonly athleteId: string;
  readonly currentVersionNumber: number;
  readonly versions: readonly PlanVersion[];
  readonly snapshots: readonly PlanSnapshot[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
