import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceViewModel } from "../viewmodels";

export interface UseHydrationOptions {
  readonly service?: NutritionExperienceService;
  readonly viewModel?: NutritionExperienceViewModel;
}

export function useHydration({ service, viewModel: injected }: UseHydrationOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NutritionExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    hydration: viewModel.hydration,
    loadHydration: useCallback(() => viewModel.loadHydration(), [viewModel]),
    viewModel,
  };
}
