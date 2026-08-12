import { ApiError } from "../../../../api/client";
import { NutritionExperienceError } from "../../services";
import type { NutritionDay } from "../../models";
import { createNutritionDay } from "../../models";

jest.mock("../../../../api/nutrition", () => ({
  getDailyNutritionTargets: jest.fn(),
  listMealLogs: jest.fn(),
}));

// Imported after the mocks are registered so the provider module picks up the mocked functions.
import { backendNutritionExperienceService } from "../BackendNutritionExperienceService";

const mockedGetDailyNutritionTargets = jest.requireMock("../../../../api/nutrition")
  .getDailyNutritionTargets as jest.MockedFunction<
  typeof import("../../../../api/nutrition").getDailyNutritionTargets
>;
const mockedListMealLogs = jest.requireMock("../../../../api/nutrition")
  .listMealLogs as jest.MockedFunction<typeof import("../../../../api/nutrition").listMealLogs>;

const TODAY: NutritionDay = createNutritionDay({
  id: "today",
  isoDate: "2026-08-12",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

function buildDailyNutrition(overrides: Record<string, unknown> = {}) {
  return {
    targets: {
      calories: "2450.00",
      protein_g: "180.00",
      carbs_g: "260.00",
      fat_g: "75.00",
    },
    actual: {
      calories: "1160.00",
      protein_g: "76.00",
      carbs_g: "88.00",
      fat_g: "28.00",
    },
    adherence: {
      calories: "under",
      protein_g: "under",
      carbs_g: "under",
      fat_g: "under",
    },
    summary_text:
      "Estimated daily targets — calories: 2450, protein: 180 g, carbs: 260 g, fat: 75 g. Adherence — calories: under, protein: under, carbs: under, fat: under.",
    for_date: "2026-08-12",
    ...overrides,
  };
}

function buildMealLog(overrides: Record<string, unknown> = {}) {
  return {
    id: "log-1",
    user_id: "user-1",
    meal_id: "meal-1",
    name_snapshot: "Overnight oats",
    meal_type: "breakfast" as const,
    calories: "520.00",
    protein_g: "34.00",
    carbs_g: "58.00",
    fat_g: "16.00",
    consumed_at: "2026-08-12T07:30:00.000Z",
    notes: null,
    created_at: "2026-08-12T07:31:00.000Z",
    updated_at: "2026-08-12T07:31:00.000Z",
    ...overrides,
  };
}

describe("backendNutritionExperienceService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("has the backend provider id", () => {
    expect(backendNutritionExperienceService.providerId).toBe("backend");
  });

  describe("authenticated Nutrition reads", () => {
    it("maps GET /targets + GET /logs into the Nutrition Experience dashboard via the authenticated API client", async () => {
      mockedGetDailyNutritionTargets.mockResolvedValueOnce(buildDailyNutrition());
      mockedListMealLogs.mockResolvedValueOnce({
        items: [
          buildMealLog(),
          buildMealLog({
            id: "log-2",
            name_snapshot: "Chicken rice bowl",
            meal_type: "lunch",
            calories: "640.00",
            protein_g: "42.00",
            carbs_g: "70.00",
            fat_g: "18.00",
            consumed_at: "2026-08-12T13:00:00.000Z",
          }),
        ],
        total: 2,
        limit: 100,
        offset: 0,
      });

      const dto = await backendNutritionExperienceService.getDashboard(TODAY);

      expect(mockedGetDailyNutritionTargets).toHaveBeenCalledWith({ for_date: "2026-08-12" });
      expect(mockedListMealLogs).toHaveBeenCalledWith({
        date_from: "2026-08-12",
        date_to: "2026-08-12",
        limit: 100,
        offset: 0,
      });
      expect(dto.day.isoDate).toBe("2026-08-12");
      expect(dto.summary).toContain("Estimated daily targets");
      expect(dto.macros.calories.current).toBe(1160);
      expect(dto.macros.calories.target).toBe(2450);
      expect(dto.macros.protein.currentGrams).toBe(76);
      expect(dto.macros.protein.targetGrams).toBe(180);
      expect(dto.meals).toHaveLength(2);
      expect(dto.meals[0]?.title).toBe("Overnight oats");
      expect(dto.meals[0]?.kind).toBe("breakfast");
      expect(dto.meals[0]?.isCompleted).toBe(true);
      expect(dto.meals[0]?.scheduledTime).toBe("07:30");
      expect(dto.meals[1]?.kind).toBe("lunch");
      // Unsupported domains stay empty rather than invented.
      expect(dto.hydration.currentMl).toBe(0);
      expect(dto.hydration.goalMl).toBe(0);
      expect(dto.coachSuggestions).toHaveLength(0);
    });

    it("requests the selected day's backend data when navigating days", async () => {
      const yesterday = createNutritionDay({
        id: "yesterday",
        isoDate: "2026-08-11",
        label: "Yesterday",
        shortLabel: "Yday",
        relativeLabel: "Yesterday",
        isToday: false,
      });
      mockedGetDailyNutritionTargets.mockResolvedValueOnce(
        buildDailyNutrition({ for_date: "2026-08-11" }),
      );
      mockedListMealLogs.mockResolvedValueOnce({
        items: [],
        total: 0,
        limit: 100,
        offset: 0,
      });

      await backendNutritionExperienceService.getDashboard(yesterday);

      expect(mockedGetDailyNutritionTargets).toHaveBeenCalledWith({ for_date: "2026-08-11" });
      expect(mockedListMealLogs).toHaveBeenCalledWith({
        date_from: "2026-08-11",
        date_to: "2026-08-11",
        limit: 100,
        offset: 0,
      });
    });

    it("maps Decimal-as-string macros from the backend into numbers for getMacros", async () => {
      mockedGetDailyNutritionTargets.mockResolvedValueOnce(buildDailyNutrition());

      const macros = await backendNutritionExperienceService.getMacros(TODAY);

      expect(mockedGetDailyNutritionTargets).toHaveBeenCalledWith({ for_date: "2026-08-12" });
      expect(macros.calories.current).toBe(1160);
      expect(macros.carbohydrates.targetGrams).toBe(260);
      expect(macros.fat.currentGrams).toBe(28);
    });

    it("maps meal logs into MealDto slices for getMeals", async () => {
      mockedListMealLogs.mockResolvedValueOnce({
        items: [
          buildMealLog({
            id: "log-snack",
            meal_type: "snack",
            name_snapshot: "Protein bar",
            consumed_at: "2026-08-12T16:00:00.000Z",
          }),
        ],
        total: 1,
        limit: 100,
        offset: 0,
      });

      const meals = await backendNutritionExperienceService.getMeals(TODAY);

      expect(meals).toHaveLength(1);
      expect(meals[0]?.kind).toBe("custom");
      expect(meals[0]?.calories).toBe(520);
      expect(meals[0]?.isCompleted).toBe(true);
    });
  });

  describe("error handling", () => {
    it("wraps a network/API failure as a NutritionExperienceError, never the raw exception", async () => {
      mockedGetDailyNutritionTargets.mockRejectedValueOnce(
        new ApiError(500, null, "Internal Server Error"),
      );

      const failure = backendNutritionExperienceService.getDashboard(TODAY);

      await expect(failure).rejects.toBeInstanceOf(NutritionExperienceError);
      await expect(failure).rejects.toThrow("Internal Server Error");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("surfaces a backend validation failure (incomplete nutrition profile) as a NutritionExperienceError", async () => {
      mockedGetDailyNutritionTargets.mockRejectedValueOnce(
        new ApiError(
          422,
          { detail: "Nutrition profile is incomplete: missing height_cm." },
          "Nutrition profile is incomplete: missing height_cm.",
        ),
      );

      const failure = backendNutritionExperienceService.getMacros(TODAY);

      await expect(failure).rejects.toBeInstanceOf(NutritionExperienceError);
      await expect(failure).rejects.toThrow(/incomplete/i);
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("does not report a successful dashboard when either backend read fails", async () => {
      mockedGetDailyNutritionTargets.mockResolvedValueOnce(buildDailyNutrition());
      mockedListMealLogs.mockRejectedValueOnce(new ApiError(503, null, "Service Unavailable"));

      await expect(backendNutritionExperienceService.getDashboard(TODAY)).rejects.toThrow(
        "Service Unavailable",
      );
    });
  });

  describe("unsupported Nutrition operations", () => {
    it.each([
      ["getHydration", () => backendNutritionExperienceService.getHydration(TODAY)],
      ["getCoachSuggestions", () => backendNutritionExperienceService.getCoachSuggestions(TODAY)],
      [
        "toggleMealCompletion",
        () => backendNutritionExperienceService.toggleMealCompletion(TODAY, "log-1"),
      ],
    ])("%s stays explicitly unsupported by the backend", async (_name, call) => {
      await expect(call()).rejects.toBeInstanceOf(NutritionExperienceError);
      await expect(call()).rejects.toThrow(/not supported by the backend/i);
      expect(mockedGetDailyNutritionTargets).not.toHaveBeenCalled();
      expect(mockedListMealLogs).not.toHaveBeenCalled();
    });

    it("has no NutritionExperienceService mutation that maps to a backend endpoint (meal completion / hydration logging absent)", async () => {
      // Documented contract: POST/PATCH/DELETE /logs and hydration are outside
      // NutritionExperienceService. The only mutation on the interface is
      // toggleMealCompletion, which remains unsupported rather than faked.
      await expect(
        backendNutritionExperienceService.toggleMealCompletion(TODAY, "log-1"),
      ).rejects.toThrow(/Meal completion is not supported/);
    });
  });
});
