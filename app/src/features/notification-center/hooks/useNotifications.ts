import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { NotificationCenterService } from "../services";
import { NotificationCenterViewModel } from "../viewmodels";

export interface UseNotificationsOptions {
  readonly service?: NotificationCenterService;
  readonly viewModel?: NotificationCenterViewModel;
  readonly autoLoad?: boolean;
}

export function useNotifications({
  service,
  viewModel: injected,
  autoLoad = true,
}: UseNotificationsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NotificationCenterViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  useEffect(() => {
    if (autoLoad && !injected) {
      void viewModel.loadNotifications();
    }
  }, [autoLoad, injected, viewModel]);

  return {
    notifications: viewModel.notifications,
    reminders: viewModel.reminders,
    coachNotifications: viewModel.coachNotifications,
    settings: viewModel.settings,
    statistics: viewModel.statistics,
    loading: viewModel.loading,
    saving: viewModel.saving,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    refresh: useCallback(() => viewModel.refresh(), [viewModel]),
    loadNotifications: useCallback(() => viewModel.loadNotifications(), [viewModel]),
    dismiss: useCallback((id: string) => viewModel.dismiss(id), [viewModel]),
    markRead: useCallback((id: string) => viewModel.markRead(id), [viewModel]),
    addReminder: useCallback((r: Parameters<NotificationCenterViewModel["addReminder"]>[0]) => viewModel.addReminder(r), [viewModel]),
    editReminder: useCallback((r: Parameters<NotificationCenterViewModel["editReminder"]>[0]) => viewModel.editReminder(r), [viewModel]),
    removeReminder: useCallback((id: string) => viewModel.removeReminder(id), [viewModel]),
    updateSettings: useCallback((s: Parameters<NotificationCenterViewModel["updateSettings"]>[0]) => viewModel.updateSettings(s), [viewModel]),
    viewModel,
  };
}
