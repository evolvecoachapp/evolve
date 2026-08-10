import {
  formatDashboardDate,
  formatDashboardGreeting,
} from "../../../features/dashboard/utils/presentationFormatters";
import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import {
  createDashboardProjectionAthleteCard,
  type DashboardProjectionAthleteCard,
  type DashboardProjectionIdentity,
} from "../models";

/** Projects Unified Workspace header, health, and snapshot into a Dashboard athlete card. */
export function mapWorkspaceToAthleteCard(
  workspace: Workspace,
  identity: DashboardProjectionIdentity,
): DashboardProjectionAthleteCard {
  const now =
    identity.now ?? new Date(workspace.header.generatedAt);
  const avgCalories = workspace.nutrition.macros?.calories ?? 0;

  return createDashboardProjectionAthleteCard({
    displayName: identity.displayName,
    initials: identity.initials,
    greeting: formatDashboardGreeting(now),
    dateLabel: formatDashboardDate(now),
    subtitle: workspace.summary.narrative.trim() || workspace.header.headline,
    streakDays: 0,
    recoveryScore: workspace.recovery.fatigueScore ?? 0,
    workoutsCompleted: 0,
    workoutsTarget: 0,
    avgCalories,
    present: workspace.snapshot.present || workspace.summary.snapshotAvailable,
  });
}
