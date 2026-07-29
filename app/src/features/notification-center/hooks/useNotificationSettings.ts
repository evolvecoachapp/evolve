import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { NotificationCenterService } from "../services";
import { NotificationCenterViewModel } from "../viewmodels";

export interface UseNotificationSettingsOptions {
  readonly service?: NotificationCenterService;
  readonly viewModel?: NotificationCenterViewModel;
}

export function useNotificationSettings({ service, viewModel: injected }: UseNotificationSettingsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NotificationCenterViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    settings: viewModel.settings,
    updateSettings: useCallback((s: Parameters<NotificationCenterViewModel["updateSettings"]>[0]) => viewModel.updateSettings(s), [viewModel]),
    viewModel,
  };
}
