/**
 * Capability policy kinds (behaviour rules only — no execution).
 */
export const CapabilityPolicyKinds = {
  DUPLICATE_HANDLING: "duplicate_handling",
  OWNERSHIP: "ownership",
  UNIQUENESS: "uniqueness",
  CONSISTENCY: "consistency",
} as const;

export type CapabilityPolicyKind =
  (typeof CapabilityPolicyKinds)[keyof typeof CapabilityPolicyKinds];

/**
 * Immutable policy descriptor for registry behaviour.
 */
export interface CapabilityPolicy {
  readonly id: string;
  readonly kind: CapabilityPolicyKind;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
}
