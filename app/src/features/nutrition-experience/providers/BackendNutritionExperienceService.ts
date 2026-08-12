import { getDailyNutritionTargets, listMealLogs } from "../../../api/nutrition";
import { ApiError } from "../../../api/client";
import {
  mapBackendNutritionToDashboard,
  mapDailyNutritionToMacroProgress,
  mapMealLogsToMealDtos,
} from "../mappers/mapBackendNutritionToExperienceDto";
import type { NutritionDay } from "../models";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceError } from "../services";

/**
 * Backend provider — talks to the already-implemented Nutrition FastAPI
 * surface (`/api/v1/nutrition`) via the shared authenticated API client.
 *
 * Supported reads:
 * - Daily macros/targets via `GET /targets?for_date=`
 * - Day meals via `GET /logs?date_from=&date_to=`
 * - Dashboard composition of the above
 *
 * Explicitly unsupported (no matching Nutrition API endpoint):
 * - Hydration logging / hydration progress
 * - Coach suggestions
 * - Meal completion toggles
 *
 * Unsupported slices stay throwing on their dedicated service methods rather
 * than inventing backend data. Dashboard hydration/coach fields are empty
 * placeholders (same pattern as Profile Experience unsupported domains).
 */

function toNutritionExperienceError(error: unknown, fallback: string): NutritionExperienceError {
  if (error instanceof NutritionExperienceError) {
    return error;
  }
  if (error instanceof ApiError) {
    return new NutritionExperienceError(error.message, "backend");
  }
  return new NutritionExperienceError(
    error instanceof Error ? error.message : fallback,
    "backend",
  );
}

function unsupportedCapability(name: string): NutritionExperienceError {
  return new NutritionExperienceError(
    `${name} is not supported by the backend nutrition API yet — see /api/v1/nutrition.`,
    "backend",
  );
}

async function fetchDayDashboard(day: NutritionDay) {
  const isoDate = day.isoDate;
  const [daily, logsPage] = await Promise.all([
    getDailyNutritionTargets({ for_date: isoDate }),
    listMealLogs({
      date_from: isoDate,
      date_to: isoDate,
      limit: 100,
      offset: 0,
    }),
  ]);
  return mapBackendNutritionToDashboard({
    day,
    daily,
    logs: logsPage.items,
  });
}

export const backendNutritionExperienceService: NutritionExperienceService = {
  providerId: "backend",

  async getDashboard(day) {
    try {
      return await fetchDayDashboard(day);
    } catch (error) {
      throw toNutritionExperienceError(error, "Failed to load nutrition dashboard.");
    }
  },

  async getMeals(day) {
    try {
      const logsPage = await listMealLogs({
        date_from: day.isoDate,
        date_to: day.isoDate,
        limit: 100,
        offset: 0,
      });
      return mapMealLogsToMealDtos(logsPage.items);
    } catch (error) {
      throw toNutritionExperienceError(error, "Failed to load nutrition meals.");
    }
  },

  async getMacros(day) {
    try {
      const daily = await getDailyNutritionTargets({ for_date: day.isoDate });
      return mapDailyNutritionToMacroProgress(daily);
    } catch (error) {
      throw toNutritionExperienceError(error, "Failed to load nutrition macros.");
    }
  },

  async getHydration() {
    throw unsupportedCapability("Hydration tracking");
  },

  async getCoachSuggestions() {
    throw unsupportedCapability("Coach suggestions");
  },

  async toggleMealCompletion() {
    throw unsupportedCapability("Meal completion");
  },
};
