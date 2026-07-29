import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProfileExperienceService } from "../services";
import { ProfileExperienceViewModel } from "../viewmodels";

export interface UseGoalsOptions {
  readonly service?: ProfileExperienceService;
  readonly viewModel?: ProfileExperienceViewModel;
}

export function useGoals({ service, viewModel: injected }: UseGoalsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProfileExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    goals: viewModel.profile?.goals ?? Object.freeze([]),
    updateGoals: useCallback((g: Parameters<ProfileExperienceViewModel["updateGoals"]>[0]) => viewModel.updateGoals(g), [viewModel]),
    viewModel,
  };
}
