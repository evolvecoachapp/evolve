import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProfileExperienceService } from "../services";
import { ProfileExperienceViewModel } from "../viewmodels";

export interface UseNutritionPreferencesOptions {
  readonly service?: ProfileExperienceService;
  readonly viewModel?: ProfileExperienceViewModel;
}

export function useNutritionPreferences({ service, viewModel: injected }: UseNutritionPreferencesOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProfileExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    nutritionPreferences: viewModel.profile?.nutritionPreferences ?? null,
    updateNutritionPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateNutritionPreferences"]>[0]) => viewModel.updateNutritionPreferences(p), [viewModel]),
    viewModel,
  };
}
