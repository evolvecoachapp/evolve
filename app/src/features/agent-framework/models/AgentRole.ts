/**
 * Immutable agent role identifiers.
 */
export type AgentRole =
  | "workout"
  | "nutrition"
  | "recovery"
  | "goal"
  | "coach_supervisor"
  | "generic";

export const AgentRoles = Object.freeze({
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  COACH_SUPERVISOR: "coach_supervisor",
  GENERIC: "generic",
} as const satisfies Record<string, AgentRole>);

export const ALL_AGENT_ROLES: readonly AgentRole[] = Object.freeze([
  AgentRoles.WORKOUT,
  AgentRoles.NUTRITION,
  AgentRoles.RECOVERY,
  AgentRoles.GOAL,
  AgentRoles.COACH_SUPERVISOR,
  AgentRoles.GENERIC,
]);
