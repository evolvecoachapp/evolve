import { mapNutritionDashboard } from "../mappers";
import { createNutritionDay, type NutritionDashboard, type NutritionDay } from "../models";
import { nutritionExperienceService, type NutritionExperienceService } from "../services";

export interface LoadNutritionDashboardDeps {
  readonly service?: NutritionExperienceService;
  readonly day?: NutritionDay;
}

const TODAY = createNutritionDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

export async function loadNutritionDashboard(
  deps: LoadNutritionDashboardDeps = {},
): Promise<NutritionDashboard> {
  const service = deps.service ?? nutritionExperienceService;
  const dto = await service.getDashboard(deps.day ?? TODAY);
  return mapNutritionDashboard(dto);
}
