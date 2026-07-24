export const SessionPhases = {
  INITIALIZE: "initialize",
  INTERACT: "interact",
  CONTINUE: "continue",
  FINALIZE: "finalize",
  IDLE: "idle",
} as const;

export type SessionPhase =
  (typeof SessionPhases)[keyof typeof SessionPhases];
