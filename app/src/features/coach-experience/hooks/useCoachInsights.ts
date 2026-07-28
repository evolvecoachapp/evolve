import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { CoachExperienceService } from "../services";
import { CoachExperienceViewModel } from "../viewmodels";

export interface UseCoachInsightsOptions {
  readonly service?: CoachExperienceService;
  readonly viewModel?: CoachExperienceViewModel;
}

/** Subscribes to insight projection — no business logic. */
export function useCoachInsights({
  service,
  viewModel: injected,
}: UseCoachInsightsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);

  const viewModel = useMemo(
    () => injected ?? new CoachExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  const loadDailyInsight = useCallback(
    () => viewModel.loadDailyInsight(),
    [viewModel],
  );
  const pinInsight = useCallback(
    (insightId: string) => viewModel.pinInsight(insightId),
    [viewModel],
  );
  const dismissInsight = useCallback(
    (insightId: string) => viewModel.dismissInsight(insightId),
    [viewModel],
  );

  return {
    dailyInsight: viewModel.dailyInsight,
    pinnedInsight: viewModel.pinnedInsight,
    loadDailyInsight,
    pinInsight,
    dismissInsight,
    viewModel,
  };
}
