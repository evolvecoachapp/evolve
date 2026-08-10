export interface RecoverySignal {
  readonly id: string;
  readonly summary: string;
}

export function createRecoverySignal(input: RecoverySignal): RecoverySignal {
  return Object.freeze({ ...input });
}
