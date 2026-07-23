/**
 * Routing session lifecycle states (orchestration only — no execution).
 */
export const RoutingStates = {
  IDLE: "idle",
  RECEIVING: "receiving",
  RESOLVING: "resolving",
  PLANNING: "planning",
  VALIDATING: "validating",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type RoutingState =
  (typeof RoutingStates)[keyof typeof RoutingStates];
