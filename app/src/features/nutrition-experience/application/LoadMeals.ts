import { mapMeals } from "../mappers";
import { createNutritionDay, type Meal, type NutritionDay } from "../models";
import { nutritionExperienceService, type NutritionExperienceService } from "../services";

export interface LoadMealsDeps {
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

export async function loadMeals(deps: LoadMealsDeps = {}): Promise<readonly Meal[]> {
  const service = deps.service ?? nutritionExperienceService;
  const dto = await service.getMeals(deps.day ?? TODAY);
  return mapMeals(dto);
}
