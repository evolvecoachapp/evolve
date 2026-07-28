import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { AthleteIdentityInput } from "../mappers";
import type { HomeService } from "../services";
import { HomeDashboardViewModel } from "../viewmodels";

export interface UseHomeDashboardOptions {
  readonly service?: HomeService;
  readonly identity: AthleteIdentityInput;
}

/**
 * Subscribes to HomeDashboardViewModel — no business logic in the hook.
 */
export function useHomeDashboard({
  service,
  identity,
}: UseHomeDashboardOptions) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const identityKey = `${identity.displayName}|${identity.initials}`;

  const viewModel = useMemo(
    () =>
      new HomeDashboardViewModel({
        service,
        identity,
      }),
    // identity applied via setIdentity / load when identityKey changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- service identity only
    [service],
  );

  useEffect(() => {
    viewModel.setIdentity(identity);
  }, [viewModel, identityKey, identity]);

  useEffect(() => {
    return viewModel.subscribe(bump);
  }, [viewModel]);

  useEffect(() => {
    void viewModel.load();
  }, [viewModel, identityKey]);

  const refresh = useCallback(() => viewModel.refresh(), [viewModel]);

  return {
    dashboard: viewModel.dashboard,
    athlete: viewModel.athlete,
    workout: viewModel.workout,
    nutrition: viewModel.nutrition,
    recovery: viewModel.recovery,
    coach: viewModel.coach,
    quickActions: viewModel.quickActions,
    loading: viewModel.loading,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    refresh,
    viewModel,
  };
}
