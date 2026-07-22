/** Equipment codes available in the knowledge base. */
export type EquipmentCode =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "band"
  | "safety_bar"
  | "smith_machine"
  | "trap_bar"
  | "ez_bar"
  | "other";

export const EQUIPMENT_CODES = Object.freeze([
  "barbell",
  "dumbbell",
  "kettlebell",
  "cable",
  "machine",
  "bodyweight",
  "band",
  "safety_bar",
  "smith_machine",
  "trap_bar",
  "ez_bar",
  "other",
] as const satisfies readonly EquipmentCode[]);

/**
 * Equipment needed or optional for an exercise.
 */
export interface EquipmentRequirement {
  readonly equipment: EquipmentCode;
  /** When true the exercise cannot be performed without this equipment. */
  readonly required: boolean;
}
