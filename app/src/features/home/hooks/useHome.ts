import { useEffect, useState } from "react";
import { homeService, type HomeService } from "../services";
import type { HomeDashboard } from "../types/homeDashboard";

interface UseHomeOptions {
  service?: HomeService;
}

export function useHome({ service = homeService }: UseHomeOptions = {}) {
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
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
