/**
 * Identifiers for independent progression strategies.
 * Model-level catalog — the strategy classes live under strategies/.
 */
export type ProgressionStrategyKind =
  | "linear"
  | "volume"
  | "intensity"
  | "frequency"
  | "exercise_rotation";

export const PROGRESSION_STRATEGY_KINDS = Object.freeze([
  "linear",
  "volume",
  "intensity",
  "frequency",
  "exercise_rotation",
] as const satisfies readonly ProgressionStrategyKind[]);
