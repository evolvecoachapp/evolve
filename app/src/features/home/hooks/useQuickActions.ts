import { useEffect, useState } from "react";
import { loadQuickActions } from "../application";
import type { QuickAction } from "../models/QuickAction";
import { homeService, type HomeService } from "../services";

export interface UseQuickActionsOptions {
  readonly service?: HomeService;
}

/**
 * Loads Home quick actions via the application layer.
 */
export function useQuickActions({
  service = homeService,
}: UseQuickActionsOptions = {}) {
  const [actions, setActions] = useState<readonly QuickAction[]>(
    Object.freeze([]),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadQuickActions({ service })
      .then((next) => {
        if (cancelled) {
          return;
        }
        setActions(next);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }
        setActions(Object.freeze([]));
        setError(
          caught instanceof Error
            ? caught.message
            : "Failed to load quick actions.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [service]);

  return {
    actions,
    loading,
    error,
  };
}
