import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import {
  createDashboardProjection,
  type DashboardProjection,
  type DashboardProjectionIdentity,
} from "../models";
import { mapWorkspaceCoachToCard } from "./mapWorkspaceCoachToCard";
import { mapWorkspaceNutritionToCard } from "./mapWorkspaceNutritionToCard";
import { mapWorkspaceRecoveryToCard } from "./mapWorkspaceRecoveryToCard";
import { mapWorkspaceToAthleteCard } from "./mapWorkspaceToAthleteCard";
import { mapWorkspaceToQuickActions } from "./mapWorkspaceToQuickActions";
import { mapWorkspaceWorkoutToCard } from "./mapWorkspaceWorkoutToCard";

export interface MapWorkspaceToDashboardProjectionInput {
  readonly workspace: Workspace;
  readonly identity: DashboardProjectionIdentity;
  readonly projectedAt: string;
}

/** Maps a Unified Workspace into the immutable Dashboard projection read model. */
export function mapWorkspaceToDashboardProjection(
  input: MapWorkspaceToDashboardProjectionInput,
): DashboardProjection {
  const { workspace, identity, projectedAt } = input;

  const workout = mapWorkspaceWorkoutToCard(
    workspace.workout,
    workspace.header.statusLabel,
  );
  const nutrition = mapWorkspaceNutritionToCard(workspace.nutrition);
  const recovery = mapWorkspaceRecoveryToCard(workspace.recovery);
  const coach = mapWorkspaceCoachToCard(workspace.coach);
  const athlete = mapWorkspaceToAthleteCard(workspace, identity);
  const quickActions = mapWorkspaceToQuickActions(workspace);

  const isEmpty =
    !workout.present &&
    !nutrition.present &&
    !recovery.present &&
    !coach.present;

  return createDashboardProjection({
    workspaceId: workspace.id,
    athleteId: workspace.athleteId,
    headline: workspace.header.headline,
    statusLabel: workspace.header.statusLabel,
    athlete,
    workout,
    nutrition,
    recovery,
    coach,
    quickActions,
    isEmpty,
    projectedAt,
  });
}
