export interface NutritionAdaptationPort {
  loadNutritionAdaptationKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockNutritionAdaptationPort(
  keys: readonly string[] = ["nutrition:adherence", "nutrition:calories"],
): NutritionAdaptationPort {
  return {
    loadNutritionAdaptationKeys() {
      return Object.freeze([...keys]);
    },
  };
}
