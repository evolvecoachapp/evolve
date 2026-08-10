import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import { mapNutritionDashboard } from "../mappers";
import { mapWorkspaceNutritionToExperienceDto } from "../mappers/mapWorkspaceNutritionToExperienceDto";
import {
  createNutritionDay,
  type NutritionDashboard,
  type NutritionDay,
} from "../models";

function resolveNutritionPlan(
  planHistory: PlanHistoryService,
  planId: string | null,
): NutritionPlan | null {
  if (!planId) {
    return null;
  }

  for (const lineageId of planHistory.getStore().listLineageIds("nutrition")) {
    const snapshot = planHistory.getCurrentSnapshot(lineageId);
    if (snapshot?.nutritionPlan?.id === planId) {
      return snapshot.nutritionPlan;
    }
  }

  return null;
}

export interface LoadHydratedNutritionExperienceOptions {
  readonly athleteId: string;
  readonly day?: NutritionDay;
  readonly toggledMealIds?: ReadonlySet<string>;
  readonly hydrationMl?: number;
}

const DEFAULT_DAY = createNutritionDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

/**
 * Loads today's nutrition experience from hydrated Unified Workspace and optional
 * cached Nutrition Plan history.
 */
export async function loadHydratedNutritionExperience({
  athleteId,
  day = DEFAULT_DAY,
  toggledMealIds,
  hydrationMl,
}: LoadHydratedNutritionExperienceOptions): Promise<NutritionDashboard | null> {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  if (!workspace) {
    return null;
  }

  const planHistory = root.resolve("PlanHistoryService");
  const plan = resolveNutritionPlan(planHistory, workspace.nutrition.planId);
  const dto = mapWorkspaceNutritionToExperienceDto({
    nutrition: workspace.nutrition,
    day,
    plan,
    toggledMealIds,
    hydrationMl,
  });

  return mapNutritionDashboard(dto);
}
