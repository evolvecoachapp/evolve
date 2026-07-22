/**
 * Domain capability a tool exposes.
 *
 * Provider-agnostic — never maps to vendor function names.
 */
export type ToolCapability =
  | "athlete_profile"
  | "workout_summary"
  | "workout_history"
  | "coach_summary"
  | "memory_context"
  | "coach_note";

export const TOOL_CAPABILITIES = Object.freeze([
  "athlete_profile",
  "workout_summary",
  "workout_history",
  "coach_summary",
  "memory_context",
  "coach_note",
] as const satisfies readonly ToolCapability[]);
