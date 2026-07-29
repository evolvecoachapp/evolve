import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceViewModel } from "../viewmodels";

export interface UseMealsOptions {
  readonly service?: NutritionExperienceService;
  readonly viewModel?: NutritionExperienceViewModel;
}

export function useMeals({ service, viewModel: injected }: UseMealsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NutritionExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    meals: viewModel.meals,
    loadMeals: useCallback(() => viewModel.loadMeals(), [viewModel]),
    toggleMealCompletion: useCallback((mealId: string) => viewModel.toggleMealCompletion(mealId), [viewModel]),
    viewModel,
  };
}
