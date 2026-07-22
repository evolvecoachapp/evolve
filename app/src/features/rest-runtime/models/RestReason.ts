/**
 * Why a rest period was started.
 */
export type RestReason =
  | "between_sets"
  | "between_exercises"
  | "between_blocks"
  | "manual"
  | "recovery"
  | "other";

export const REST_REASONS = Object.freeze([
  "between_sets",
  "between_exercises",
  "between_blocks",
  "manual",
  "recovery",
  "other",
] as const satisfies readonly RestReason[]);
