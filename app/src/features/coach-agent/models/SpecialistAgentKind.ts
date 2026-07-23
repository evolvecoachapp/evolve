/**
 * Specialist agents the Coach meta-agent may orchestrate.
 * Future agents (sleep / mobility / injury / planning) are reserved here.
 */
export const SpecialistAgentKinds = Object.freeze({
  WORKOUT: "workout" as const,
  RECOVERY: "recovery" as const,
  NUTRITION: "nutrition" as const,
  SLEEP: "sleep" as const,
  MOBILITY: "mobility" as const,
  INJURY: "injury" as const,
  PLANNING: "planning" as const,
});

export type SpecialistAgentKind =
  (typeof SpecialistAgentKinds)[keyof typeof SpecialistAgentKinds];

/** Agents currently invocable by the Coach Agent. */
export const IMPLEMENTED_SPECIALIST_AGENTS: readonly SpecialistAgentKind[] =
  Object.freeze([
    SpecialistAgentKinds.WORKOUT,
    SpecialistAgentKinds.RECOVERY,
    SpecialistAgentKinds.NUTRITION,
  ]);

/** All known specialist kinds including future placeholders. */
export const ALL_SPECIALIST_AGENT_KINDS: readonly SpecialistAgentKind[] =
  Object.freeze(Object.values(SpecialistAgentKinds));
