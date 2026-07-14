import { useEffect, useState } from "react";
import type { ProgressDashboard } from "../models/ProgressDashboard";
import { progressService, type ProgressService } from "../services";

interface UseProgressOptions {
  service?: ProgressService;
}

export function useProgress({ service = progressService }: UseProgressOptions = {}) {
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void service.getDashboard().then((nextDashboard) => {
      if (cancelled) {
        return;
      }
      setDashboard(nextDashboard);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [service]);

  return {
    dashboard,
    loading,
  };
}
