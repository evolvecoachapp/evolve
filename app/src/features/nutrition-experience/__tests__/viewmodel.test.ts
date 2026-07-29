import { createNutritionDay, NutritionLoadingStatuses } from "../models";
import { emptyMockNutritionExperienceService, mockNutritionExperienceService } from "../providers/MockNutritionExperienceService";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceError } from "../services";
import { NutritionExperienceViewModel } from "../viewmodels";

const TODAY = createNutritionDay({
  id: "today",
  isoDate: "2026-07-29",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

describe("NutritionExperienceViewModel", () => {
  it("loads dashboard nutrition data", async () => {
    const viewModel = new NutritionExperienceViewModel({
      service: mockNutritionExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    expect(viewModel.loading.status).toBe(NutritionLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard?.headline).toContain("kcal");
  });

  it("exposes error state when provider fails", async () => {
    const failing: NutritionExperienceService = {
      providerId: "mock",
      async getDashboard() { throw new NutritionExperienceError("load failed", "mock"); },
      async getMeals() { throw new NutritionExperienceError("meals failed", "mock"); },
      async getMacros() { throw new NutritionExperienceError("macros failed", "mock"); },
      async getHydration() { throw new NutritionExperienceError("hydration failed", "mock"); },
      async getCoachSuggestions() { throw new NutritionExperienceError("coach failed", "mock"); },
      async toggleMealCompletion() { throw new NutritionExperienceError("toggle failed", "mock"); },
    };
    const viewModel = new NutritionExperienceViewModel({ service: failing, initialDay: TODAY });
    await viewModel.loadDashboard();
    expect(viewModel.dashboard).toBeNull();
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores dashboard after a transient error", async () => {
    let calls = 0;
    const service: NutritionExperienceService = {
      providerId: "mock",
      async getDashboard(day) {
        calls += 1;
        if (calls === 1) {
          throw new NutritionExperienceError("transient", "mock");
        }
        return mockNutritionExperienceService.getDashboard(day);
      },
      getMeals: mockNutritionExperienceService.getMeals,
      getMacros: mockNutritionExperienceService.getMacros,
      getHydration: mockNutritionExperienceService.getHydration,
      getCoachSuggestions: mockNutritionExperienceService.getCoachSuggestions,
      toggleMealCompletion: mockNutritionExperienceService.toggleMealCompletion,
    };
    const viewModel = new NutritionExperienceViewModel({ service, initialDay: TODAY });
    await viewModel.loadDashboard();
    expect(viewModel.error).not.toBeNull();
    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard).not.toBeNull();
  });

  it("reloads meals, hydration, macros, and coach suggestions independently", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: mockNutritionExperienceService, initialDay: TODAY });
    await viewModel.loadDashboard();
    await viewModel.loadMeals();
    await viewModel.loadHydration();
    await viewModel.loadMacros();
    await viewModel.loadCoachSuggestions();
    expect(viewModel.meals.length).toBeGreaterThan(0);
    expect(viewModel.hydration?.currentMl).toBeGreaterThan(0);
    expect(viewModel.macros?.protein.currentGrams).toBeGreaterThan(0);
    expect(viewModel.coachSuggestions.length).toBeGreaterThan(0);
  });

  it("toggles meal completion", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: mockNutritionExperienceService, initialDay: TODAY });
    await viewModel.loadDashboard();
    await viewModel.toggleMealCompletion("lunch");
    expect(viewModel.meals.find((meal) => meal.id === "lunch")?.isCompleted).toBe(true);
  });

  it("changes day and reloads dashboard", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: mockNutritionExperienceService, initialDay: TODAY });
    await viewModel.loadDashboard();
    const tomorrow = createNutritionDay({
      id: "tomorrow",
      isoDate: "2026-07-30",
      label: "Tomorrow",
      shortLabel: "Tom",
      relativeLabel: "Tomorrow",
      isToday: false,
    });
    await viewModel.changeDay(tomorrow);
    expect(viewModel.day.isoDate).toBe("2026-07-30");
  });

  it("marks empty dashboard states", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: emptyMockNutritionExperienceService, initialDay: TODAY });
    await viewModel.loadDashboard();
    expect(viewModel.isEmpty).toBe(true);
  });

  it("notifies subscribers on load", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: mockNutritionExperienceService, initialDay: TODAY });
    const listener = jest.fn();
    viewModel.subscribe(listener);
    await viewModel.loadDashboard();
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
