import type { EquipmentCode } from "../models/EquipmentRequirement";
import type { ExerciseDefinition } from "../models/ExerciseDefinition";

const EQUIPMENT_WEIGHTS: Readonly<Record<EquipmentCode, number>> = {
  bodyweight: 1,
  band: 1.5,
  dumbbell: 2,
  kettlebell: 2,
  ez_bar: 2.5,
  cable: 3,
  trap_bar: 3,
  barbell: 4,
  safety_bar: 4,
  smith_machine: 3.5,
  machine: 2.5,
  other: 2,
};

/**
 * Equipment accessibility / demand score.
 * Lower means easier access; higher means more specialized equipment.
 */
export function calculateEquipmentScore(
  definition: ExerciseDefinition,
): number {
  if (definition.equipment.length === 0) {
    return 0;
  }

  let score = 0;
  for (const requirement of definition.equipment) {
    const weight = EQUIPMENT_WEIGHTS[requirement.equipment] ?? 2;
    score += requirement.required ? weight : weight * 0.5;
  }

  return Math.round(score * 10) / 10;
}
