import { mapCoachSuggestions } from "../mappers";
import {
  createNutritionDay,
  type NutritionCoachSuggestion,
  type NutritionDay,
} from "../models";
import { nutritionExperienceService, type NutritionExperienceService } from "../services";

export interface LoadCoachSuggestionsDeps {
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

export async function loadCoachSuggestions(
  deps: LoadCoachSuggestionsDeps = {},
): Promise<readonly NutritionCoachSuggestion[]> {
  const service = deps.service ?? nutritionExperienceService;
  const dto = await service.getCoachSuggestions(deps.day ?? TODAY);
  return mapCoachSuggestions(dto);
}
