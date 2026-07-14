import type { NutritionSummary } from "./NutritionSummary";

/** Historical nutrition summaries returned by nutrition providers. */
export interface NutritionHistory {
  summaries: NutritionSummary[];
}
