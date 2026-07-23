import type { NutritionIntent } from "../models/NutritionIntent";
import { NutritionIntents } from "../models/NutritionIntent";

export class IntentSelector {
  select(input: {
    readonly intentHint: NutritionIntent | null;
    readonly message: string;
  }): NutritionIntent {
    if (input.intentHint && input.intentHint !== NutritionIntents.UNKNOWN) {
      return input.intentHint;
    }
    const msg = input.message.toLowerCase();
    if (msg.includes("macro")) return NutritionIntents.ADJUST_MACROS;
    if (msg.includes("meal") || msg.includes("timing"))
      return NutritionIntents.MEAL_TIMING;
    if (msg.includes("supplement")) return NutritionIntents.SUPPLEMENTATION;
    if (msg.includes("hydrat") || msg.includes("water"))
      return NutritionIntents.HYDRATION;
    if (msg.includes("educat") || msg.includes("explain"))
      return NutritionIntents.EDUCATION;
    if (msg.includes("evaluat") || msg.includes("review"))
      return NutritionIntents.EVALUATE_PLAN;
    if (msg.includes("body comp") || msg.includes("recomp"))
      return NutritionIntents.BODY_COMPOSITION;
    if (msg.includes("plan") || msg.includes("diet") || msg.includes("nutrition"))
      return NutritionIntents.PLAN_NUTRITION;
    return NutritionIntents.PLAN_NUTRITION;
  }
}
