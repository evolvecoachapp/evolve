import { useMemo } from "react";
import { homeService, type HomeService } from "../services";
import { useHomeDashboard } from "./useHomeDashboard";

interface UseHomeOptions {
  service?: HomeService;
  displayName?: string;
  initials?: string;
}

/**
 * Legacy Home hook — delegates to HomeDashboardViewModel.
 * Prefer `useHomeDashboard` for new screens.
 */
export function useHome({
  service = homeService,
  displayName = "Athlete",
  initials = "A",
}: UseHomeOptions = {}) {
  const identity = useMemo(
    () =>
      Object.freeze({
        displayName,
        initials,
      }),
    [displayName, initials],
  );

  const { dashboard, loading, error, refresh } = useHomeDashboard({
    service,
    identity,
  });

  return {
    dashboard,
    loading: loading.isLoading,
    error: error?.message ?? null,
    refresh,
  };
}
