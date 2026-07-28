import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { CoachExperienceService } from "../services";
import { CoachExperienceViewModel } from "../viewmodels";

export interface UseCoachQuickActionsOptions {
  readonly service?: CoachExperienceService;
  readonly viewModel?: CoachExperienceViewModel;
}

/** Subscribes to quick-action projection — no business logic. */
export function useCoachQuickActions({
  service,
  viewModel: injected,
}: UseCoachQuickActionsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);

  const viewModel = useMemo(
    () => injected ?? new CoachExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  const suggestActions = useCallback(
    () => viewModel.suggestActions(),
    [viewModel],
  );

  return {
    quickActions: viewModel.quickActions,
    suggestActions,
    viewModel,
  };
}
