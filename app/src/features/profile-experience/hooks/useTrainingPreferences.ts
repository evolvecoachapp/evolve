import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProfileExperienceService } from "../services";
import { ProfileExperienceViewModel } from "../viewmodels";

export interface UseTrainingPreferencesOptions {
  readonly service?: ProfileExperienceService;
  readonly viewModel?: ProfileExperienceViewModel;
}

export function useTrainingPreferences({ service, viewModel: injected }: UseTrainingPreferencesOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProfileExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    trainingPreferences: viewModel.profile?.trainingPreferences ?? null,
    updateTrainingPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateTrainingPreferences"]>[0]) => viewModel.updateTrainingPreferences(p), [viewModel]),
    viewModel,
  };
}
