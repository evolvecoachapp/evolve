import { getWorkspace } from "../../../features/unified-workspace/application";
import {
  composeTestWorkspaceForAthlete,
  createTestUnifiedWorkspaceServiceForDashboard,
  FIXED_DASHBOARD_ATHLETE_ID,
  FIXED_DASHBOARD_IDENTITY,
  FIXED_DASHBOARD_PROJECTED_AT,
} from "../testSupport/fixtures";
import {
  projectAthleteWorkspaceToDashboard,
  projectWorkspaceToDashboard,
} from "../application";
import { createDashboardProjectionIntegration } from "../composition";

describe("dashboard-projection integration", () => {
  it("projects unified workspace into dashboard without circular dependencies", () => {
    const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard({
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });
    const athleteId = FIXED_DASHBOARD_ATHLETE_ID;

    composeTestWorkspaceForAthlete(unifiedWorkspaceService, athleteId);

    const { projector } = createDashboardProjectionIntegration({
      unifiedWorkspaceService,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });

    const workspace = getWorkspace({ athleteId, service: unifiedWorkspaceService });
    expect(workspace).not.toBeNull();

    const directResult = projectWorkspaceToDashboard({
      projector,
      workspace: workspace!,
      identity: FIXED_DASHBOARD_IDENTITY,
    });

    const athleteResult = projectAthleteWorkspaceToDashboard({
      projector: createDashboardProjectionIntegration({
        unifiedWorkspaceService,
        clock: () => FIXED_DASHBOARD_PROJECTED_AT,
      }).projector,
      athleteId,
      identity: FIXED_DASHBOARD_IDENTITY,
    });

    expect(directResult.accepted).toBe(true);
    expect(directResult.projection?.athleteId).toBe(athleteId);
    expect(athleteResult?.accepted).toBe(true);
    expect(athleteResult?.projection?.workspaceId).toBe(workspace!.id);
  });
});
