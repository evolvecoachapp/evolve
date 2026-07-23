import type { NutritionPreferences } from "../models/NutritionPreferences";

export class PreferenceSelector {
  select(
    preferences: NutritionPreferences | null | undefined,
  ): NutritionPreferences {
    return Object.freeze({
      vegetarian: preferences?.vegetarian ?? false,
      vegan: preferences?.vegan ?? false,
      mealsPerDayPreference: preferences?.mealsPerDayPreference ?? null,
      preferredFoods: Object.freeze([...(preferences?.preferredFoods ?? [])]),
      avoidedFoods: Object.freeze([...(preferences?.avoidedFoods ?? [])]),
    });
  }
}
