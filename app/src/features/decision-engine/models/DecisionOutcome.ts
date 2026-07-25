export const DecisionOutcomes = {
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  DEFERRED: "deferred",
  SUPERSEDED: "superseded",
  PENDING: "pending",
} as const;

export type DecisionOutcome =
  (typeof DecisionOutcomes)[keyof typeof DecisionOutcomes];
