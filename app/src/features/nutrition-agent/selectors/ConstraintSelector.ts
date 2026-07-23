import type { NutritionConstraints } from "../models/NutritionConstraints";

export class ConstraintSelector {
  select(flags: readonly string[]): NutritionConstraints {
    const allergies = flags
      .filter((f) => f.startsWith("allergy:"))
      .map((f) => f.slice("allergy:".length));
    const medicalNotes = flags
      .filter((f) => f.startsWith("medical:"))
      .map((f) => f.slice("medical:".length));
    return Object.freeze({
      allergies: Object.freeze(allergies),
      medicalNotes: Object.freeze(medicalNotes),
      minCalories: flags.includes("min_calories_strict") ? 1500 : null,
      maxCalories: null,
      flags: Object.freeze([...flags]),
    });
  }
}
