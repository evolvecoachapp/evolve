export interface RecoveryStatistics {
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly replacementCount: number;
  readonly decisionKeyCount: number;
  readonly dayKeyCount: number;
  readonly readinessKeyCount: number;
}
