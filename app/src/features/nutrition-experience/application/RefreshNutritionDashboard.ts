import { loadNutritionDashboard, type LoadNutritionDashboardDeps } from "./LoadNutritionDashboard";

export async function refreshNutritionDashboard(deps: LoadNutritionDashboardDeps = {}) {
  return loadNutritionDashboard(deps);
}
