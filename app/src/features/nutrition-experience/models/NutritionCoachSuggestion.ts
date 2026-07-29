export type NutritionCoachSuggestionTone = "positive" | "attention" | "celebration";

export interface NutritionCoachSuggestion {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly metric: string;
  readonly tone: NutritionCoachSuggestionTone;
  readonly destination: string | null;
}

export function createNutritionCoachSuggestion(input: NutritionCoachSuggestion): NutritionCoachSuggestion {
  return Object.freeze({ ...input });
}
