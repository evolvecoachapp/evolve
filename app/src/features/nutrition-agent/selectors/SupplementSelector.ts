import type { NutritionContext } from "../models/NutritionContext";
import type { SupplementPlan } from "../models/SupplementPlan";

export class SupplementSelector {
  select(context: NutritionContext): SupplementPlan {
    const training =
      context.goal === "muscle_gain" ||
      context.goal === "hypertrophy" ||
      context.goal === "powerlifting" ||
      context.goal === "performance";
    return Object.freeze({
      items: Object.freeze(
        training
          ? ["creatine_monohydrate", "vitamin_d_if_deficient"]
          : ["vitamin_d_if_deficient"],
      ),
      notes: Object.freeze(["Optional; not medical advice."]),
    });
  }
}
