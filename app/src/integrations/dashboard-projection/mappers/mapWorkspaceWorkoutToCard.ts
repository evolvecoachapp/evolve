import type { WorkspaceWorkout } from "../../../features/unified-workspace/models/WorkspaceWorkout";
import {
  createDashboardProjectionWorkoutCard,
  type DashboardProjectionWorkoutCard,
} from "../models";
import { WORKOUT_DESTINATION } from "./dashboardDestinations";

/** Projects Unified Workspace workout section into a Dashboard workout card. */
export function mapWorkspaceWorkoutToCard(
  workout: WorkspaceWorkout,
  statusLabel: string | null,
): DashboardProjectionWorkoutCard {
  const name = workout.planName?.trim() || workout.summary.trim();
  const present = workout.present && name.length > 0;

  return createDashboardProjectionWorkoutCard({
    present,
    name: present ? name : "",
    muscleGroups: workout.summary.trim(),
    durationMinutes: 0,
    statusLabel: statusLabel?.trim() || (present ? "Ready" : "No workout"),
    destination: WORKOUT_DESTINATION,
  });
}
