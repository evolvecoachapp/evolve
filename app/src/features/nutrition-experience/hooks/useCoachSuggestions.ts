import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceViewModel } from "../viewmodels";

export interface UseCoachSuggestionsOptions {
  readonly service?: NutritionExperienceService;
  readonly viewModel?: NutritionExperienceViewModel;
}

export function useCoachSuggestions({
  service,
  viewModel: injected,
}: UseCoachSuggestionsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NutritionExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    suggestions: viewModel.coachSuggestions,
    loadCoachSuggestions: useCallback(() => viewModel.loadCoachSuggestions(), [viewModel]),
    viewModel,
  };
}
