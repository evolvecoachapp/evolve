import { mapMacros } from "../mappers";
import { createNutritionDay, type MacroProgress, type NutritionDay } from "../models";
import { nutritionExperienceService, type NutritionExperienceService } from "../services";

export interface LoadMacrosDeps {
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

export async function loadMacros(deps: LoadMacrosDeps = {}): Promise<MacroProgress> {
  const service = deps.service ?? nutritionExperienceService;
  const dto = await service.getMacros(deps.day ?? TODAY);
  return mapMacros(dto);
}
