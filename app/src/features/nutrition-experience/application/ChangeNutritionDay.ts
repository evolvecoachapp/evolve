import { createNutritionDay, type NutritionDay } from "../models";

export interface ChangeNutritionDayInput {
  readonly day: NutritionDay;
}

export function changeNutritionDay(input: ChangeNutritionDayInput): NutritionDay {
  return createNutritionDay({ ...input.day });
}
