import { useEffect } from "react";
import { WorkoutTimerStatuses } from "../models/experience/WorkoutTimer";
import type { WorkoutRuntimeViewModel } from "../viewmodels";

export interface UseRestTimerOptions {
  readonly viewModel: WorkoutRuntimeViewModel;
  readonly enabled?: boolean;
}

/** Drives rest + session duration ticks via the ViewModel (no business logic). */
export function useRestTimer({
  viewModel,
  enabled = true,
}: UseRestTimerOptions) {
  const timer = viewModel.runtime?.timer ?? null;
  const isRunning = timer?.status === WorkoutTimerStatuses.RUNNING;

  useEffect(() => {
    if (!enabled || !isRunning) {
      return;
    }
    const id = setInterval(() => {
      viewModel.tickRestTimer();
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, isRunning, viewModel]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const id = setInterval(() => {
      viewModel.tickDuration();
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, viewModel]);

  return {
    timer,
    isRunning,
    isPaused: timer?.status === WorkoutTimerStatuses.PAUSED,
    pause: () => viewModel.pauseRestTimer(),
    resume: () => viewModel.resumeRestTimer(),
    start: (seconds?: number) => viewModel.startRestTimer(seconds),
  };
}
