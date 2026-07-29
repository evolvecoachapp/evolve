import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProfileExperienceService } from "../services";
import { ProfileExperienceViewModel } from "../viewmodels";

export interface UseCoachPreferencesOptions {
  readonly service?: ProfileExperienceService;
  readonly viewModel?: ProfileExperienceViewModel;
}

export function useCoachPreferences({ service, viewModel: injected }: UseCoachPreferencesOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProfileExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    coachPreferences: viewModel.profile?.coachPreferences ?? null,
    updateCoachPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateCoachPreferences"]>[0]) => viewModel.updateCoachPreferences(p), [viewModel]),
    viewModel,
  };
}
