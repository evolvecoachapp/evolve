import type { RecoveryMetadata } from "./RecoveryMetadata";

export const RecoveryModificationKinds = {
  ADJUSTMENT: "adjustment",
  REPLACEMENT: "replacement",
  INSERTION: "insertion",
  REMOVAL: "removal",
} as const;

export type RecoveryModificationKind =
  (typeof RecoveryModificationKinds)[keyof typeof RecoveryModificationKinds];

export interface RecoveryModification {
  readonly id: string;
  readonly kind: RecoveryModificationKind;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
