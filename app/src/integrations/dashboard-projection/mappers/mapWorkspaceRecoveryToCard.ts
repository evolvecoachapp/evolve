import type { WorkspaceRecovery } from "../../../features/unified-workspace/models/WorkspaceRecovery";
import {
  createDashboardProjectionRecoveryCard,
  type DashboardProjectionRecoveryCard,
} from "../models";

/** Projects Unified Workspace recovery section into a Dashboard recovery card. */
export function mapWorkspaceRecoveryToCard(
  recovery: WorkspaceRecovery,
): DashboardProjectionRecoveryCard {
  const tip =
    recovery.summary.trim() ||
    recovery.signalSummaries[0]?.trim() ||
    "";

  return createDashboardProjectionRecoveryCard({
    present: recovery.present,
    score: recovery.fatigueScore ?? 0,
    status: recovery.status?.trim() || "",
    tip,
  });
}
