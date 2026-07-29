import { act, renderHook, waitFor } from "@testing-library/react-native";
import { createNutritionDay } from "../models";
import { emptyMockNutritionExperienceService, mockNutritionExperienceService } from "../providers/MockNutritionExperienceService";
import { useCoachSuggestions, useHydration, useMeals, useNutritionDashboard } from "../hooks";
import { NutritionExperienceViewModel } from "../viewmodels";

const TODAY = createNutritionDay({
  id: "today",
  isoDate: "2026-07-29",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

describe("nutrition-experience hooks", () => {
  it("useNutritionDashboard loads the dashboard", async () => {
    const { result } = renderHook(() => useNutritionDashboard({ service: mockNutritionExperienceService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.headline).toContain("kcal");
  });

  it("useNutritionDashboard exposes empty state", async () => {
    const { result } = renderHook(() => useNutritionDashboard({ service: emptyMockNutritionExperienceService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it("useMeals toggles meal completion through the view model", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: mockNutritionExperienceService, initialDay: TODAY });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useMeals({ viewModel }));
    await act(async () => {
      await result.current.toggleMealCompletion("lunch");
    });
    expect(result.current.meals.find((meal) => meal.id === "lunch")?.isCompleted).toBe(true);
  });

  it("useHydration exposes hydration projection", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: mockNutritionExperienceService, initialDay: TODAY });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useHydration({ viewModel }));
    expect(result.current.hydration?.goalMl).toBeGreaterThan(0);
  });

  it("useCoachSuggestions projects coach suggestions", async () => {
    const viewModel = new NutritionExperienceViewModel({ service: mockNutritionExperienceService, initialDay: TODAY });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useCoachSuggestions({ viewModel }));
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    await act(async () => {
      await result.current.loadCoachSuggestions();
    });
    expect(result.current.suggestions[0]?.title).toContain("carbohydrates");
  });
});
