import type { NutritionDashboard } from "../models";

function percent(current: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

export interface LogRuntimeHydrationInput {
  readonly dashboard: NutritionDashboard;
  readonly amountMl: number;
}

/** Adds hydration volume to a runtime-driven nutrition dashboard. */
export function logRuntimeHydration(
  input: LogRuntimeHydrationInput,
): NutritionDashboard {
  const hydration = input.dashboard.hydration;
  const currentMl = Math.max(0, hydration.currentMl + input.amountMl);
  const nextHydration = Object.freeze({
    ...hydration,
    currentMl,
    remainingMl: Math.max(0, hydration.goalMl - currentMl),
    completionPercent: percent(currentMl, hydration.goalMl),
  });

  return Object.freeze({
    ...input.dashboard,
    hydration: nextHydration,
    nutritionScore: Math.round(
      (input.dashboard.macros.score +
        input.dashboard.mealSummary.completionPercent +
        nextHydration.completionPercent) /
        3,
    ),
  });
}
