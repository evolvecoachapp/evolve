/**
 * Policy kinds for Agent Collaboration behaviour.
 */
export const CollaborationPolicyKinds = {
  EXECUTION_ORDERING: "execution_ordering",
  DUPLICATE_HANDLING: "duplicate_handling",
  PARTICIPANT_ELIGIBILITY: "participant_eligibility",
  AGGREGATION_RULES: "aggregation_rules",
} as const;

export type CollaborationPolicyKind =
  (typeof CollaborationPolicyKinds)[keyof typeof CollaborationPolicyKinds];

/**
 * Immutable collaboration policy descriptor (no business logic).
 */
export interface CollaborationPolicy {
  readonly id: string;
  readonly kind: CollaborationPolicyKind;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
}
