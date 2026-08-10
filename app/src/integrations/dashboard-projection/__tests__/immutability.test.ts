import {
  createDashboardProjection,
  createDashboardProjectionIdentity,
  createDashboardProjectionResult,
  createDashboardProjectionSnapshot,
} from "../models";

describe("dashboard-projection immutability", () => {
  it("freezes projection identity and results", () => {
    const identity = createDashboardProjectionIdentity({
      displayName: "Alex Rivera",
      initials: "AR",
    });

    const result = createDashboardProjectionResult({
      workspaceId: "workspace:1",
      athleteId: "athlete:1",
      accepted: true,
      projectedAt: "2026-08-10T10:00:00.000Z",
      projection: null,
    });

    const snapshot = createDashboardProjectionSnapshot({
      projectedWorkspaceCount: 1,
      lastWorkspaceId: "workspace:1",
      lastAthleteId: "athlete:1",
      lastHeadline: "Ready to train",
      capturedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(identity)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it("freezes dashboard projection and quick actions", () => {
    const projection = createDashboardProjection({
      workspaceId: "workspace:1",
      athleteId: "athlete:1",
      headline: "Ready to train",
      statusLabel: "On track",
      athlete: Object.freeze({
        displayName: "Alex Rivera",
        initials: "AR",
        greeting: "Good morning",
        dateLabel: "Monday, August 10",
        subtitle: "Your daily performance at a glance",
        streakDays: 0,
        recoveryScore: 80,
        workoutsCompleted: 0,
        workoutsTarget: 0,
        avgCalories: 2200,
        present: true,
      }),
      workout: Object.freeze({
        present: true,
        name: "Upper Body",
        muscleGroups: "Chest, Back",
        durationMinutes: 0,
        statusLabel: "Ready",
        destination: "/(app)/(tabs)/workout",
      }),
      nutrition: Object.freeze({
        present: true,
        calories: Object.freeze({
          current: 2200,
          target: 2200,
          progressPercent: 0,
          unitLabel: "",
        }),
        protein: Object.freeze({
          current: 160,
          target: 160,
          progressPercent: 0,
          unitLabel: "g",
        }),
        carbs: Object.freeze({
          current: 250,
          target: 250,
          progressPercent: 0,
          unitLabel: "g",
        }),
        fat: Object.freeze({
          current: 70,
          target: 70,
          progressPercent: 0,
          unitLabel: "g",
        }),
        destination: "/(app)/(tabs)/nutrition",
      }),
      recovery: Object.freeze({
        present: true,
        score: 80,
        status: "stable",
        tip: "Recovery is stable.",
      }),
      coach: Object.freeze({
        present: true,
        message: "Maintain current intensity.",
        actionLabel: "Ask Coach →",
        destination: "/(app)/(tabs)/coach",
      }),
      quickActions: Object.freeze([
        Object.freeze({
          id: "qa:start_workout",
          kind: "start_workout",
          label: "Start Workout",
          icon: "barbell-outline",
          destination: "/(app)/(tabs)/workout",
          enabled: true,
          reason: "Today's workout is available.",
        }),
      ]),
      isEmpty: false,
      projectedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.quickActions)).toBe(true);
    expect(Object.isFrozen(projection.quickActions[0])).toBe(true);
  });
});
