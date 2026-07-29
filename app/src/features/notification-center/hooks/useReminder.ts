import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { NotificationCenterService } from "../services";
import { NotificationCenterViewModel } from "../viewmodels";

export interface UseReminderOptions {
  readonly service?: NotificationCenterService;
  readonly viewModel?: NotificationCenterViewModel;
}

export function useReminder({ service, viewModel: injected }: UseReminderOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NotificationCenterViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    reminders: viewModel.reminders,
    addReminder: useCallback((r: Parameters<NotificationCenterViewModel["addReminder"]>[0]) => viewModel.addReminder(r), [viewModel]),
    editReminder: useCallback((r: Parameters<NotificationCenterViewModel["editReminder"]>[0]) => viewModel.editReminder(r), [viewModel]),
    removeReminder: useCallback((id: string) => viewModel.removeReminder(id), [viewModel]),
    viewModel,
  };
}
