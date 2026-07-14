import { useEffect, useState } from "react";
import type { NutritionDashboard } from "../models/NutritionDashboard";
import { nutritionService, type NutritionService } from "../services";

interface UseNutritionOptions {
  service?: NutritionService;
}

export function useNutrition({ service = nutritionService }: UseNutritionOptions = {}) {
  const [nutrition, setNutrition] = useState<NutritionDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void service.getTodayNutrition().then((nextNutrition) => {
      if (cancelled) {
        return;
      }
      setNutrition(nextNutrition);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [service]);

  return {
    nutrition,
    loading,
  };
}
