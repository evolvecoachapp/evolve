import { projectWorkspaceToDashboard } from "../application";
import { createDashboardProjectionIntegration } from "../composition";
import {
  createTestUnifiedWorkspaceServiceForDashboard,
  createTestWorkspace,
  FIXED_DASHBOARD_IDENTITY,
  FIXED_DASHBOARD_PROJECTED_AT,
} from "../testSupport/fixtures";

describe("dashboard-projection projection", () => {
  it("projects unified workspace into dashboard read model", () => {
    const workspace = createTestWorkspace();
    const service = createTestUnifiedWorkspaceServiceForDashboard({
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });
    const { projector } = createDashboardProjectionIntegration({
      unifiedWorkspaceService: service,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });

    const result = projectWorkspaceToDashboard({
      projector,
      workspace,
      identity: FIXED_DASHBOARD_IDENTITY,
    });

    expect(result.accepted).toBe(true);
    expect(result.projection?.workspaceId).toBe(workspace.id);
    expect(result.projection?.athlete.displayName).toBe("Alex Rivera");
    expect(result.projection?.headline).toBe(workspace.header.headline);
  });

  it("tracks projected workspace ids in projector snapshot", () => {
    const workspace = createTestWorkspace();
    const service = createTestUnifiedWorkspaceServiceForDashboard();
    const { projector } = createDashboardProjectionIntegration({
      unifiedWorkspaceService: service,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });

    projectWorkspaceToDashboard({
      projector,
      workspace,
      identity: FIXED_DASHBOARD_IDENTITY,
    });

    const snapshot = projector.getSnapshot();
    expect(snapshot.projectedWorkspaceCount).toBe(1);
    expect(snapshot.lastWorkspaceId).toBe(workspace.id);
    expect(snapshot.lastAthleteId).toBe(workspace.athleteId);
    expect(snapshot.lastHeadline).toBe(workspace.header.headline);
  });
});
