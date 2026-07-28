import { HomeDashboardViewModel } from "../viewmodels";
import type { HomeDashboard as HomeDashboardDto } from "../types/homeDashboard";
import type { HomeService } from "../types/homeService";
import { HomeServiceError } from "../types/homeService";
import { mockHomeDashboardData } from "../mocks/dashboardData";
import { HomeLoadingStatuses } from "../models";

const identity = Object.freeze({
  displayName: "Jordan",
  initials: "JO",
  now: new Date("2026-07-29T15:00:00.000Z"),
});

function createService(options?: {
  dto?: HomeDashboardDto;
  fail?: boolean;
  failOnce?: boolean;
}): HomeService {
  let calls = 0;
  return {
    providerId: "mock",
    async getDashboard() {
      calls += 1;
      if (options?.fail) {
        throw new HomeServiceError("load failed", "mock");
      }
      if (options?.failOnce && calls === 1) {
        throw new HomeServiceError("transient", "mock");
      }
      return { ...(options?.dto ?? mockHomeDashboardData) };
    },
  };
}

describe("HomeDashboardViewModel", () => {
  it("loads athlete, workout, nutrition, recovery, coach, and quick actions", async () => {
    const viewModel = new HomeDashboardViewModel({
      service: createService(),
      identity,
    });

    await viewModel.load();

    expect(viewModel.loading.status).toBe(HomeLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.athlete?.displayName).toBe("Jordan");
    expect(viewModel.workout?.name).toBe("Upper Body Strength");
    expect(viewModel.nutrition?.protein.current).toBe(142);
    expect(viewModel.recovery?.score).toBe(82);
    expect(viewModel.coach?.present).toBe(true);
    expect(viewModel.quickActions.length).toBeGreaterThan(0);
    expect(viewModel.isEmpty).toBe(false);
  });

  it("exposes error state when the provider fails", async () => {
    const viewModel = new HomeDashboardViewModel({
      service: createService({ fail: true }),
      identity,
    });

    await viewModel.load();

    expect(viewModel.dashboard).toBeNull();
    expect(viewModel.error?.retryable).toBe(true);
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores dashboard after a prior error", async () => {
    const viewModel = new HomeDashboardViewModel({
      service: createService({ failOnce: true }),
      identity,
    });

    await viewModel.load();
    expect(viewModel.error).not.toBeNull();

    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard?.workout.name).toBe("Upper Body Strength");
    expect(viewModel.loading.isRefreshing).toBe(false);
  });

  it("notifies subscribers on load", async () => {
    const viewModel = new HomeDashboardViewModel({
      service: createService(),
      identity,
    });
    const listener = jest.fn();
    viewModel.subscribe(listener);

    await viewModel.load();

    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("marks empty dashboards", async () => {
    const emptyDto: HomeDashboardDto = {
      ...mockHomeDashboardData,
      workoutPreview: { name: "", muscleGroups: "", durationMinutes: 0 },
      nutritionSummary: {
        calories: { current: 0, target: 0 },
        protein: { current: 0, target: 0 },
        carbs: { current: 0, target: 0 },
        fat: { current: 0, target: 0 },
      },
      recovery: { score: -1, status: "", tip: "" },
      coachSummary: { message: "" },
    };

    const viewModel = new HomeDashboardViewModel({
      service: createService({ dto: emptyDto }),
      identity,
    });

    await viewModel.load();
    expect(viewModel.isEmpty).toBe(true);
  });
});
