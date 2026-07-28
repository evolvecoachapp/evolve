import {
  loadAthleteSnapshot,
  loadHomeDashboard,
  loadQuickActions,
  refreshHomeDashboard,
} from "../application";
import type { HomeDashboard as HomeDashboardDto } from "../types/homeDashboard";
import type { HomeService } from "../types/homeService";
import { HomeServiceError } from "../types/homeService";
import { mockHomeDashboardData } from "../mocks/dashboardData";

const identity = Object.freeze({
  displayName: "Alex",
  initials: "AL",
  now: new Date("2026-07-29T10:00:00.000Z"),
});

function createService(
  overrides?: Partial<HomeDashboardDto>,
  options?: { fail?: boolean },
): HomeService {
  if (options?.fail) {
    return {
      providerId: "mock",
      async getDashboard() {
        throw new HomeServiceError("dashboard unavailable", "mock");
      },
    };
  }

  return {
    providerId: "mock",
    async getDashboard() {
      return {
        ...mockHomeDashboardData,
        ...overrides,
        recovery: {
          ...mockHomeDashboardData.recovery,
          ...overrides?.recovery,
        },
        streak: {
          ...mockHomeDashboardData.streak,
          ...overrides?.streak,
        },
        weeklyProgress: {
          ...mockHomeDashboardData.weeklyProgress,
          ...overrides?.weeklyProgress,
        },
        workoutPreview: {
          ...mockHomeDashboardData.workoutPreview,
          ...overrides?.workoutPreview,
        },
        nutritionSummary: {
          ...mockHomeDashboardData.nutritionSummary,
          ...overrides?.nutritionSummary,
        },
        coachSummary: {
          ...mockHomeDashboardData.coachSummary,
          ...overrides?.coachSummary,
        },
        notifications: overrides?.notifications ?? mockHomeDashboardData.notifications,
      };
    },
  };
}

describe("home application APIs", () => {
  it("loadHomeDashboard maps provider data into immutable HomeDashboard", async () => {
    const dashboard = await loadHomeDashboard({
      service: createService(),
      identity,
    });

    expect(Object.isFrozen(dashboard)).toBe(true);
    expect(dashboard.athlete.displayName).toBe("Alex");
    expect(dashboard.athlete.initials).toBe("AL");
    expect(dashboard.workout.name).toBe("Upper Body Strength");
    expect(dashboard.nutrition.calories.current).toBe(1840);
    expect(dashboard.nutrition.protein.progressPercent).toBe(79);
    expect(dashboard.recovery.score).toBe(82);
    expect(dashboard.coach.present).toBe(true);
    expect(dashboard.quickActions.length).toBeGreaterThan(0);
    expect(dashboard.isEmpty).toBe(false);
  });

  it("refreshHomeDashboard returns a fresh mapped dashboard", async () => {
    const service = createService();
    const first = await loadHomeDashboard({ service, identity });
    const second = await refreshHomeDashboard({ service, identity });

    expect(second).not.toBe(first);
    expect(second.workout.name).toBe(first.workout.name);
  });

  it("loadQuickActions returns enabled navigation placeholders", async () => {
    const actions = await loadQuickActions({ service: createService() });

    expect(actions.some((action) => action.kind === "start_workout")).toBe(
      true,
    );
    expect(actions.find((action) => action.kind === "start_workout")?.enabled).toBe(
      true,
    );
    expect(
      actions.find((action) => action.kind === "start_workout")?.destination,
    ).toBe("/(app)/(tabs)/workout");
  });

  it("loadAthleteSnapshot projects recovery and weekly progress", async () => {
    const athlete = await loadAthleteSnapshot({
      service: createService(),
      identity,
    });

    expect(athlete.recoveryScore).toBe(82);
    expect(athlete.streakDays).toBe(5);
    expect(athlete.workoutsCompleted).toBe(3);
    expect(athlete.greeting).toContain("Good");
  });

  it("propagates provider failures", async () => {
    await expect(
      loadHomeDashboard({ service: createService(undefined, { fail: true }), identity }),
    ).rejects.toBeInstanceOf(HomeServiceError);
  });
});
