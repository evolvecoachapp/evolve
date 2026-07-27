import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";
import type { PlanVersion } from "../../plan-history/models/PlanVersion";

/**
 * Domain-only preview of a restore before publish.
 * No UI rendering.
 */
export interface PlanRestorePreview {
  readonly id: string;
  readonly requestId: string;
  readonly currentVersion: PlanVersion;
  readonly targetVersion: PlanVersion;
  readonly targetSnapshot: PlanSnapshot;
  readonly recoveredChangesSummary: readonly string[];
  readonly discardedChangesSummary: readonly string[];
  readonly warnings: readonly string[];
  readonly createdAt: string;
}
