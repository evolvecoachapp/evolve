/**
 * Policy identifiers used by Conversation Memory orchestration.
 */
export const MemoryPolicyKinds = {
  RETENTION: "retention",
  MERGE: "merge",
  CONFLICT: "conflict",
} as const;

export type MemoryPolicyKind =
  (typeof MemoryPolicyKinds)[keyof typeof MemoryPolicyKinds];

/**
 * Immutable policy descriptor (contracts only — no persistence).
 */
export interface MemoryPolicy {
  readonly id: string;
  readonly kind: MemoryPolicyKind;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
}
