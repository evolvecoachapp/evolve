export type NutritionStatusType = "on_track" | "under" | "over" | "incomplete";

/** High-level adherence signal for the current nutrition day. */
export interface NutritionStatus {
  status: NutritionStatusType;
  completionPercent: number;
}
