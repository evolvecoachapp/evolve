/** Role a candidate may fill within a session selection. */
export type CandidateRole = "primary" | "secondary" | "accessory";

export const CANDIDATE_ROLES = Object.freeze([
  "primary",
  "secondary",
  "accessory",
] as const satisfies readonly CandidateRole[]);
