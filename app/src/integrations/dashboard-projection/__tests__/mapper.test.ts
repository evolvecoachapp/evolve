import {
  mapWorkspaceCoachToCard,
  mapWorkspaceNutritionToCard,
  mapWorkspaceRecoveryToCard,
  mapWorkspaceToDashboardProjection,
  mapWorkspaceToQuickActions,
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

  it("routes the Recovery quick action to the Recovery screen, not Progress", () => {
    const workspace = createTestWorkspace();
    const quickActions = mapWorkspaceToQuickActions(workspace);

    const recovery = quickActions.find((action) => action.id === "qa:view_recovery");

    expect(recovery?.destination).toBe("/(app)/recovery");
  });

  it("includes a Goals quick action routed to the Goals screen, enabled only when goals are present", () => {
    const workspaceWithGoals = createTestWorkspace();
    const goalsAction = mapWorkspaceToQuickActions(workspaceWithGoals).find(
      (action) => action.id === "qa:view_goals",
    );

    expect(goalsAction?.destination).toBe("/(app)/goals");
    expect(goalsAction?.enabled).toBe(workspaceWithGoals.goals.present);
  });
});
