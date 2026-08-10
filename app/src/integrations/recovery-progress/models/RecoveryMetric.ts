/** Immutable recovery metric representation — no calculations. */
export interface RecoveryMetric {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
}

export function createRecoveryMetric(input: RecoveryMetric): RecoveryMetric {
  return Object.freeze({ ...input });
}
