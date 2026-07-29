import { useEffect, useMemo, useReducer } from "react";
import type { ProgressAnalyticsService } from "../services";
import { ProgressAnalyticsViewModel } from "../viewmodels";

export interface UseAnalyticsSnapshotOptions {
  readonly service?: ProgressAnalyticsService;
  readonly viewModel?: ProgressAnalyticsViewModel;
}

export function useAnalyticsSnapshot({ service, viewModel: injected }: UseAnalyticsSnapshotOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProgressAnalyticsViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    snapshot: viewModel.snapshot,
    viewModel,
  };
}
