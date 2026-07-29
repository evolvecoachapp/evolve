import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProfileExperienceService } from "../services";
import { ProfileExperienceViewModel } from "../viewmodels";

export interface UseProfileOptions {
  readonly service?: ProfileExperienceService;
  readonly viewModel?: ProfileExperienceViewModel;
  readonly autoLoad?: boolean;
}

export function useProfile({
  service,
  viewModel: injected,
  autoLoad = true,
}: UseProfileOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProfileExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  useEffect(() => {
    if (autoLoad && !injected) {
      void viewModel.loadProfile();
    }
  }, [autoLoad, injected, viewModel]);

  return {
    profile: viewModel.profile,
    loading: viewModel.loading,
    saving: viewModel.saving,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    refresh: useCallback(() => viewModel.refresh(), [viewModel]),
    loadProfile: useCallback(() => viewModel.loadProfile(), [viewModel]),
    updateUnits: useCallback((u: Parameters<ProfileExperienceViewModel["updateUnits"]>[0]) => viewModel.updateUnits(u), [viewModel]),
    updateTheme: useCallback((p: Parameters<ProfileExperienceViewModel["updateTheme"]>[0]) => viewModel.updateTheme(p), [viewModel]),
    updateNotifications: useCallback((p: Parameters<ProfileExperienceViewModel["updateNotifications"]>[0]) => viewModel.updateNotifications(p), [viewModel]),
    updateTrainingPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateTrainingPreferences"]>[0]) => viewModel.updateTrainingPreferences(p), [viewModel]),
    updateNutritionPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateNutritionPreferences"]>[0]) => viewModel.updateNutritionPreferences(p), [viewModel]),
    updateGoals: useCallback((g: Parameters<ProfileExperienceViewModel["updateGoals"]>[0]) => viewModel.updateGoals(g), [viewModel]),
    updateCoachPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateCoachPreferences"]>[0]) => viewModel.updateCoachPreferences(p), [viewModel]),
    viewModel,
  };
}
