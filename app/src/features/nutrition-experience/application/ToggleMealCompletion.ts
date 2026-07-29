import { mapMeals } from "../mappers";
import {
  createNutritionDay,
  type Meal,
  type NutritionDay,
} from "../models";
import { nutritionExperienceService, type NutritionExperienceService } from "../services";

export interface ToggleMealCompletionDeps {
  readonly service?: NutritionExperienceService;
  readonly day?: NutritionDay;
  readonly mealId: string;
}

const TODAY = createNutritionDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

export async function toggleMealCompletion(
  deps: ToggleMealCompletionDeps,
): Promise<readonly Meal[]> {
  const service = deps.service ?? nutritionExperienceService;
  const dto = await service.toggleMealCompletion(deps.day ?? TODAY, deps.mealId);
  return mapMeals(dto);
}
