export interface NutritionErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createNutritionErrorState(
  message: string,
  code = "nutrition_experience_error",
  retryable = true,
): NutritionErrorState {
  return Object.freeze({ message, code, retryable });
}
