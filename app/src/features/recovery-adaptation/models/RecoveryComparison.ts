import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryComparison {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly addedKeys: readonly string[];
  readonly removedKeys: readonly string[];
  readonly sharedKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
