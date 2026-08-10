import {
  mapWorkspaceCoachToCard,
  mapWorkspaceNutritionToCard,
  mapWorkspaceRecoveryToCard,
  mapWorkspaceToDashboardProjection,
  mapWorkspaceWorkoutToCard,
} from "../mappers";
import {
  createTestWorkspace,
  FIXED_DASHBOARD_IDENTITY,
  FIXED_DASHBOARD_PROJECTED_AT,
} from "../testSupport/fixtures";

describe("dashboard-projection mappers", () => {
  it("maps workspace sections into dashboard cards", () => {
    const workspace = createTestWorkspace();

    const workout = mapWorkspaceWorkoutToCard(
      workspace.workout,
      workspace.header.statusLabel,
    );
    const nutrition = mapWorkspaceNutritionToCard(workspace.nutrition);
    const recovery = mapWorkspaceRecoveryToCard(workspace.recovery);
    const coach = mapWorkspaceCoachToCard(workspace.coach);

    expect(workout.destination).toBe("/(app)/(tabs)/workout");
    expect(nutrition.destination).toBe("/(app)/(tabs)/nutrition");
    expect(coach.destination).toBe("/(app)/(tabs)/coach");
    expect(recovery.present).toBe(workspace.recovery.present);
  });

  it("maps full workspace into dashboard projection", () => {
    const workspace = createTestWorkspace();
    const projection = mapWorkspaceToDashboardProjection({
      workspace,
      identity: FIXED_DASHBOARD_IDENTITY,
      projectedAt: FIXED_DASHBOARD_PROJECTED_AT,
    });

    expect(projection.workspaceId).toBe(workspace.id);
    expect(projection.athleteId).toBe(workspace.athleteId);
    expect(projection.quickActions.length).toBeGreaterThan(0);
    expect(Object.isFrozen(projection.quickActions)).toBe(true);
  });
});
