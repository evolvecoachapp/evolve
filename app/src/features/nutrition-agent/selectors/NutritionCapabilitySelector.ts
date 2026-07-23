import type { NutritionIntent } from "../models/NutritionIntent";
import { NutritionIntents } from "../models/NutritionIntent";
import type { NutritionCapability } from "../models/NutritionCapability";
import { NutritionCapabilities } from "../models/NutritionCapability";

/**
 * Deterministic Nutrition Domain capability selection from agent intent.
 * No business logic — maps intent → domain orchestration targets only.
 * Future capabilities can be added to NutritionCapabilities and mapped here.
 */
export class NutritionCapabilitySelector {
  select(intent: NutritionIntent): readonly NutritionCapability[] {
    switch (intent) {
      case NutritionIntents.PLAN_NUTRITION:
        return Object.freeze([
          NutritionCapabilities.GENERATE_NUTRITION_PLAN,
          NutritionCapabilities.MEAL_TIMING,
          NutritionCapabilities.HYDRATION_GUIDANCE,
        ]);
      case NutritionIntents.ADJUST_MACROS:
        return Object.freeze([
          NutritionCapabilities.ADJUST_MACROS,
          NutritionCapabilities.ANALYZE_NUTRITION,
        ]);
      case NutritionIntents.MEAL_TIMING:
        return Object.freeze([
          NutritionCapabilities.MEAL_TIMING,
          NutritionCapabilities.GENERATE_NUTRITION_PLAN,
        ]);
      case NutritionIntents.SUPPLEMENTATION:
        return Object.freeze([
          NutritionCapabilities.SUPPLEMENT_GUIDANCE,
          NutritionCapabilities.ANALYZE_NUTRITION,
        ]);
      case NutritionIntents.HYDRATION:
        return Object.freeze([
          NutritionCapabilities.HYDRATION_GUIDANCE,
        ]);
      case NutritionIntents.EVALUATE_PLAN:
        return Object.freeze([
          NutritionCapabilities.ANALYZE_NUTRITION,
          NutritionCapabilities.ADJUST_MACROS,
        ]);
      case NutritionIntents.BODY_COMPOSITION:
        return Object.freeze([
          NutritionCapabilities.ANALYZE_NUTRITION,
          NutritionCapabilities.ADJUST_MACROS,
          NutritionCapabilities.GENERATE_NUTRITION_PLAN,
        ]);
      case NutritionIntents.EDUCATION:
      case NutritionIntents.UNKNOWN:
      default:
        return Object.freeze([
          NutritionCapabilities.ANALYZE_NUTRITION,
        ]);
    }
  }
}

/** Alias matching workout-agent DomainCapabilitySelector naming. */
export { NutritionCapabilitySelector as DomainCapabilitySelector };
