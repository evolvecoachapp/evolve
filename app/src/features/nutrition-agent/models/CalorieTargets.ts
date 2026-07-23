/**
 * Immutable calorie target envelope for planning.
 */
export interface CalorieTargets {
  readonly tdeeEstimate: number;
  readonly targetCalories: number;
  readonly deficitOrSurplus: number;
}
