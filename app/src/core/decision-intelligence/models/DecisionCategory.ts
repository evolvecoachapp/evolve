/**
 * Domain category for a recorded workout-generation decision.
 * Categories map to pipeline stages — never implementation concerns.
 */
export type DecisionCategory =
  | "blueprint"
  | "selection"
  | "programming"
  | "progression"
  | "adaptation"
  | "assembly"
  | "orchestration"
  | "validation";

export const DECISION_CATEGORIES = Object.freeze([
  "blueprint",
  "selection",
  "programming",
  "progression",
  "adaptation",
  "assembly",
  "orchestration",
  "validation",
] as const satisfies readonly DecisionCategory[]);
