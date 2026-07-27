import type { PlanChangeReason } from "./PlanChangeReason";
import type { PlanType } from "./PlanType";

/**
 * Immutable metadata for one published plan version.
 * History never overwrites or deletes versions.
 */
export interface PlanVersion {
  readonly versionNumber: number;
  readonly snapshotId: string;
  readonly planId: string;
  readonly lineageId: string;
  readonly planType: PlanType;
  readonly changeReason: PlanChangeReason;
  readonly changeSummary: string;
  readonly checksum: string;
  readonly publishedAt: string;
  readonly athleteId: string;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
}
