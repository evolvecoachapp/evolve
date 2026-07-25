import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryDayInsertion {
  readonly id: string;
  readonly dayKey: string;
  readonly afterKey: string | null;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
