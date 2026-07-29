import { useEffect, useMemo, useReducer } from "react";
import type { NotificationCenterService } from "../services";
import { NotificationCenterViewModel } from "../viewmodels";

export interface UseNotificationStatisticsOptions {
  readonly service?: NotificationCenterService;
  readonly viewModel?: NotificationCenterViewModel;
}

export function useNotificationStatistics({ service, viewModel: injected }: UseNotificationStatisticsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NotificationCenterViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    statistics: viewModel.statistics,
    viewModel,
  };
}
