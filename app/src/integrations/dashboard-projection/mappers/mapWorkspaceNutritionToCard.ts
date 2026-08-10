import type { WorkspaceNutrition } from "../../../features/unified-workspace/models/WorkspaceNutrition";
import {
  createDashboardProjectionMacroCard,
  createDashboardProjectionNutritionCard,
  type DashboardProjectionMacroCard,
  type DashboardProjectionNutritionCard,
} from "../models";
import { NUTRITION_DESTINATION } from "./dashboardDestinations";

function mapMacro(
  value: number,
  unitLabel: string,
): DashboardProjectionMacroCard {
  return createDashboardProjectionMacroCard({
    current: value,
    target: value,
    progressPercent: 0,
    unitLabel,
  });
}

/** Projects Unified Workspace nutrition section into a Dashboard nutrition card. */
export function mapWorkspaceNutritionToCard(
  nutrition: WorkspaceNutrition,
): DashboardProjectionNutritionCard {
  const macros = nutrition.macros;
  const present = nutrition.present && macros !== null;

  return createDashboardProjectionNutritionCard({
    present,
    calories: mapMacro(present ? macros!.calories : 0, ""),
    protein: mapMacro(present ? macros!.proteinG : 0, "g"),
    carbs: mapMacro(present ? macros!.carbsG : 0, "g"),
    fat: mapMacro(present ? macros!.fatG : 0, "g"),
    destination: NUTRITION_DESTINATION,
  });
}
