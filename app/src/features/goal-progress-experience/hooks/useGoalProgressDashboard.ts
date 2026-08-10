import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { loadHydratedGoalProgressExperience } from "../application/loadHydratedGoalProgressExperience";
import type { GoalProgressExperienceService } from "../services";
import { GoalProgressExperienceViewModel } from "../viewmodels";

export interface UseGoalProgressDashboardOptions {
  readonly service?: GoalProgressExperienceService;
  readonly viewModel?: GoalProgressExperienceViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to GoalProgressExperienceViewModel — no business logic in the hook.
 * Production path applies hydrated workspace output via applyHydratedGoalProgress().
 * GoalProgressExperienceService is test/preview-only when injected explicitly.
 */
export function useGoalProgressDashboard({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseGoalProgressDashboardOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () => injected ?? new GoalProgressExperienceViewModel({ service, athleteId }),
    [injected, service, athleteId],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (!autoLoad || injected) {
      return;
    }

    if (!isRuntimePath) {
      void viewModel.loadDashboard();
      return;
    }

    if (!athleteId) {
      return;
    }

    if (runtimeStatus !== RUNTIME_SESSION_STATUS.ready) {
      return;
    }

    let cancelled = false;

    void loadHydratedGoalProgressExperience({ athleteId }).then((dashboard) => {
      if (cancelled) {
        return;
      }

      if (dashboard) {
        viewModel.applyHydratedGoalProgress(dashboard);
        return;
      }

      viewModel.applyGoalProgressFailure("Goal Progress runtime unavailable.");
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
      viewModel.applyGoalProgressFailure("Goal Progress runtime unavailable.");
      return;
    }

    const dashboard = await loadHydratedGoalProgressExperience({
      athleteId,
      reachedMilestoneIds: viewModel.dashboard?.milestones
        .filter((item) => item.reached)
        .map((item) => item.id),
      isCompleted: viewModel.dashboard?.isCompleted,
    });
    viewModel.refreshFromHydratedGoalProgress(dashboard);
  }, [viewModel, service, athleteId]);

  return {
    dashboard: viewModel.dashboard,
    loading: viewModel.loading,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    refresh,
    loadDashboard: useCallback(() => viewModel.loadDashboard(), [viewModel]),
    updateProgress: useCallback(() => viewModel.updateProgress(), [viewModel]),
    completeMilestone: useCallback(
      (milestoneId: string) => viewModel.completeMilestone(milestoneId),
      [viewModel],
    ),
    completeGoal: useCallback(() => viewModel.completeGoal(), [viewModel]),
    viewModel,
  };
}
