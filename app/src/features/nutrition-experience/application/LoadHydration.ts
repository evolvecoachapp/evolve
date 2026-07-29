import { mapHydration } from "../mappers";
import { createNutritionDay, type HydrationProgress, type NutritionDay } from "../models";
import { nutritionExperienceService, type NutritionExperienceService } from "../services";

export interface LoadHydrationDeps {
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

export async function loadHydration(deps: LoadHydrationDeps = {}): Promise<HydrationProgress> {
  const service = deps.service ?? nutritionExperienceService;
  const dto = await service.getHydration(deps.day ?? TODAY);
  return mapHydration(dto);
}
