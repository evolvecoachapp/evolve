import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { CoachExperienceService } from "../services";
import { CoachExperienceViewModel } from "../viewmodels";

export interface UseCoachRecommendationsOptions {
  readonly service?: CoachExperienceService;
  readonly viewModel?: CoachExperienceViewModel;
}

/** Subscribes to recommendation projection — no business logic. */
export function useCoachRecommendations({
  service,
  viewModel: injected,
}: UseCoachRecommendationsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);

  const viewModel = useMemo(
    () => injected ?? new CoachExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  const loadRecommendations = useCallback(
    () => viewModel.loadRecommendations(),
    [viewModel],
  );

  return {
    recommendations: viewModel.recommendations,
    loadRecommendations,
    viewModel,
  };
}
