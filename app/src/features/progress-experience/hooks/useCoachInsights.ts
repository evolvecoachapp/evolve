import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProgressExperienceService } from "../services";
import { ProgressExperienceViewModel } from "../viewmodels";

export interface UseCoachInsightsOptions {
  readonly service?: ProgressExperienceService;
  readonly viewModel?: ProgressExperienceViewModel;
}

export function useCoachInsights({ service, viewModel: injected }: UseCoachInsightsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(() => injected ?? new ProgressExperienceViewModel({ service }), [injected, service]);

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    insights: viewModel.coachInsights,
    loadCoachInsights: useCallback(() => viewModel.loadCoachInsights(), [viewModel]),
    viewModel,
  };
}
