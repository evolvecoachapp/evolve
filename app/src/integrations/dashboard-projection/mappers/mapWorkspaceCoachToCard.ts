import type { WorkspaceCoach } from "../../../features/unified-workspace/models/WorkspaceCoach";
import {
  createDashboardProjectionCoachCard,
  type DashboardProjectionCoachCard,
} from "../models";
import { COACH_DESTINATION } from "./dashboardDestinations";

/** Projects Unified Workspace coach section into a Dashboard coach card. */
export function mapWorkspaceCoachToCard(
  coach: WorkspaceCoach,
): DashboardProjectionCoachCard {
  const message =
    coach.recommendation?.trim() ||
    coach.expectedOutcome?.trim() ||
    "";

  return createDashboardProjectionCoachCard({
    present: coach.present && message.length > 0,
    message,
    actionLabel: "Ask Coach →",
    destination: COACH_DESTINATION,
  });
}
