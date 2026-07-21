/** Available equipment codes — never prose. */
export type EquipmentItem =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "cable"
  | "smith_machine"
  | "bodyweight"
  | "resistance_band"
  | "specialty_bar"
  | "other";

export const EQUIPMENT_ITEMS: readonly EquipmentItem[] = Object.freeze([
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "cable",
  "smith_machine",
  "bodyweight",
  "resistance_band",
  "specialty_bar",
  "other",
]);

/**
 * Equipment available to the athlete.
 *
 * Structured inventory only — no UI catalog.
 */
export interface EquipmentProfile {
  readonly available: readonly EquipmentItem[];
  readonly hasFullGymAccess: boolean;
}
