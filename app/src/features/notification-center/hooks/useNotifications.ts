import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { loadHydratedNotificationExperience } from "../application/loadHydratedNotificationExperience";
import type { NotificationCenterService } from "../services";
import { NotificationCenterViewModel } from "../viewmodels";

export interface UseNotificationsOptions {
  readonly service?: NotificationCenterService;
  readonly viewModel?: NotificationCenterViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to NotificationCenterViewModel — no business logic.
 * Production path applies hydrated workspace output via applyHydratedNotifications().
 * NotificationCenterService is test/preview-only when injected explicitly.
 */
export function useNotifications({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseNotificationsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () => injected ?? new NotificationCenterViewModel({ service, athleteId }),
    [injected, service, athleteId],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (!autoLoad || injected) {
      return;
    }

    if (!isRuntimePath) {
      void viewModel.loadNotifications();
      return;
    }

    if (!athleteId) {
      return;
    }

    if (runtimeStatus !== RUNTIME_SESSION_STATUS.ready) {
      return;
    }

    let cancelled = false;

    void loadHydratedNotificationExperience({ athleteId }).then((data) => {
      if (cancelled) {
        return;
      }

      if (data) {
        viewModel.applyHydratedNotifications(data);
        return;
      }

      viewModel.applyNotificationFailure("Notification runtime unavailable.");
    });

    return () => {
      cancelled = true;
    };
  }, [autoLoad, injected, viewModel, isRuntimePath, athleteKey, athleteId, runtimeStatus]);

  const refresh = useCallback(async () => {
    if (service) {
      await viewModel.refresh();
      return;
    }

    if (!athleteId) {
      viewModel.applyNotificationFailure("Notification runtime unavailable.");
      return;
    }

    const data = await loadHydratedNotificationExperience({ athleteId });
    viewModel.refreshFromHydratedNotifications(data);
  }, [viewModel, service, athleteId]);

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
    refresh,
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
