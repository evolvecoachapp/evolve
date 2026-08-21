import type { UserUpdate } from "../../types/api";
import { needsTargetWeight, type AthleteSetupValues } from "./models";
import { parsePositiveNumber } from "./parsePositiveNumber";

function normalizeText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Maps validated setup values onto the existing `UserUpdate` contract. */
export function mapSetupToUserUpdate(values: AthleteSetupValues): UserUpdate {
  const height = parsePositiveNumber(values.heightCm);
  const weight = parsePositiveNumber(values.weightKg);
  const target = parsePositiveNumber(values.targetWeightKg);

  const data: UserUpdate = {
    first_name: normalizeText(values.firstName),
    birth_date: normalizeText(values.birthDate),
    gender: values.gender,
    height_cm: height,
    current_weight_kg: weight,
    goal: values.goal,
    activity_level: values.activityLevel,
  };

  if (needsTargetWeight(values.goal) && target != null) {
    data.target_weight_kg = target;
  }

  return data;
}
