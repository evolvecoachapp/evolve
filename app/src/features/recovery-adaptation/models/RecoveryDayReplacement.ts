import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryDayReplacement {
  readonly id: string;
  readonly fromDayKey: string;
  readonly toDayKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
