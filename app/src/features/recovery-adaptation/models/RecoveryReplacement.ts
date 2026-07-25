import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryReplacement {
  readonly id: string;
  readonly fromKey: string;
  readonly toKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
