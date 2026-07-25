import type { ContextSourceKind } from "./ContextSource";

/**
 * Deterministic priority for a context source (lower rank = higher priority).
 * Representation only — no ranking inference.
 */
export interface ContextPriority {
  readonly sourceKind: ContextSourceKind;
  readonly rank: number;
  readonly label: string;
}

/**
 * Fixed deterministic priority table (athlete truth before specialists, etc.).
 */
export const DEFAULT_CONTEXT_PRIORITIES: readonly ContextPriority[] =
  Object.freeze([
    Object.freeze({
      sourceKind: "athlete" as const,
      rank: 10,
      label: "athlete_state",
    }),
    Object.freeze({
      sourceKind: "session" as const,
      rank: 20,
      label: "coaching_session",
    }),
    Object.freeze({
      sourceKind: "conversation" as const,
      rank: 30,
      label: "conversation",
    }),
    Object.freeze({
      sourceKind: "supervisor" as const,
      rank: 40,
      label: "supervisor",
    }),
    Object.freeze({
      sourceKind: "workout" as const,
      rank: 50,
      label: "workout_agent",
    }),
    Object.freeze({
      sourceKind: "nutrition" as const,
      rank: 60,
      label: "nutrition_agent",
    }),
    Object.freeze({
      sourceKind: "recovery" as const,
      rank: 70,
      label: "recovery_agent",
    }),
    Object.freeze({
      sourceKind: "goal" as const,
      rank: 80,
      label: "goal_agent",
    }),
  ]);
