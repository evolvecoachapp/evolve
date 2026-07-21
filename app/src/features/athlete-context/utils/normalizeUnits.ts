export type HeightUnit = "cm" | "in";
export type WeightUnit = "kg" | "lb";

export interface NormalizeUnitsInput {
  readonly height?: number | null;
  readonly heightUnit?: HeightUnit;
  readonly weight?: number | null;
  readonly weightUnit?: WeightUnit;
}

export interface NormalizeUnitsResult {
  readonly heightCm: number | null;
  readonly weightKg: number | null;
}

const INCHES_TO_CM = 2.54;
const LB_TO_KG = 0.45359237;

/**
 * Normalize height/weight inputs into canonical centimeters and kilograms.
 *
 * Pure conversion — no validation and no formatting.
 */
export function normalizeUnits(
  input: NormalizeUnitsInput,
): NormalizeUnitsResult {
  const heightUnit = input.heightUnit ?? "cm";
  const weightUnit = input.weightUnit ?? "kg";

  let heightCm: number | null = null;
  if (input.height != null && Number.isFinite(input.height)) {
    heightCm =
      heightUnit === "in" ? input.height * INCHES_TO_CM : input.height;
  }

  let weightKg: number | null = null;
  if (input.weight != null && Number.isFinite(input.weight)) {
    weightKg =
      weightUnit === "lb" ? input.weight * LB_TO_KG : input.weight;
  }

  return Object.freeze({
    heightCm,
    weightKg,
  });
}
