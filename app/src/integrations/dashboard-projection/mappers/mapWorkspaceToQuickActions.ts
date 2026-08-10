import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import {
  createDashboardProjectionQuickAction,
  DashboardProjectionQuickActionKinds,
  type DashboardProjectionQuickAction,
} from "../models";
import {
  COACH_DESTINATION,
  NUTRITION_DESTINATION,
  WORKOUT_DESTINATION,
} from "./dashboardDestinations";
import { mapWorkspaceCoachToCard } from "./mapWorkspaceCoachToCard";
import { mapWorkspaceNutritionToCard } from "./mapWorkspaceNutritionToCard";
import { mapWorkspaceWorkoutToCard } from "./mapWorkspaceWorkoutToCard";

/** Derives deterministic Dashboard quick actions from Unified Workspace availability. */
export function mapWorkspaceToQuickActions(
  workspace: Workspace,
): readonly DashboardProjectionQuickAction[] {
  const workout = mapWorkspaceWorkoutToCard(
    workspace.workout,
    workspace.header.statusLabel,
  );
  const nutrition = mapWorkspaceNutritionToCard(workspace.nutrition);
  const coach = mapWorkspaceCoachToCard(workspace.coach);
  const hasProgress =
    workspace.goals.present || workspace.summary.weeklyReportAvailable;

  const actions: DashboardProjectionQuickAction[] = [
    createDashboardProjectionQuickAction({
      id: "qa:start_workout",
      kind: DashboardProjectionQuickActionKinds.START_WORKOUT,
      label: "Start Workout",
      icon: "barbell-outline",
      destination: WORKOUT_DESTINATION,
      enabled: workout.present,
      reason: workout.present
        ? "Today's workout is available."
        : "No workout scheduled.",
    }),
    createDashboardProjectionQuickAction({
      id: "qa:log_nutrition",
      kind: DashboardProjectionQuickActionKinds.LOG_NUTRITION,
      label: "Log Nutrition",
      icon: "nutrition-outline",
      destination: NUTRITION_DESTINATION,
      enabled: nutrition.present,
      reason: nutrition.present
        ? "Nutrition targets are available."
        : "No nutrition targets.",
    }),
    createDashboardProjectionQuickAction({
      id: "qa:view_recovery",
      kind: DashboardProjectionQuickActionKinds.VIEW_RECOVERY,
      label: "Recovery",
      icon: "heart-outline",
      destination: "/(app)/(tabs)/progress",
      enabled: workspace.recovery.present,
      reason: workspace.recovery.present
        ? "Recovery summary is available."
        : "No recovery summary.",
    }),
    createDashboardProjectionQuickAction({
      id: "qa:ask_coach",
      kind: DashboardProjectionQuickActionKinds.ASK_COACH,
      label: "Ask Coach",
      icon: "chatbubble-ellipses-outline",
      destination: COACH_DESTINATION,
      enabled: coach.present,
      reason: coach.present
        ? "Coach insight is available."
        : "No coach insight yet.",
    }),
    createDashboardProjectionQuickAction({
      id: "qa:view_progress",
      kind: DashboardProjectionQuickActionKinds.VIEW_PROGRESS,
      label: "Progress",
      icon: "bar-chart-outline",
      destination: "/(app)/(tabs)/progress",
      enabled: hasProgress,
      reason: hasProgress
        ? "Weekly progress is available."
        : "No weekly progress yet.",
    }),
    createDashboardProjectionQuickAction({
      id: "qa:view_profile",
      kind: DashboardProjectionQuickActionKinds.VIEW_PROFILE,
      label: "Profile",
      icon: "person-outline",
      destination: "/(app)/(tabs)/profile",
      enabled: true,
      reason: "Open athlete profile.",
    }),
  ];

  return Object.freeze(actions);
}
