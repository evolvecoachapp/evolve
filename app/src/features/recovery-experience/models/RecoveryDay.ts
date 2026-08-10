export interface RecoveryDay {
  readonly id: string;
  readonly isoDate: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly relativeLabel: string;
  readonly isToday: boolean;
}

export function createRecoveryDay(input: RecoveryDay): RecoveryDay {
  return Object.freeze({ ...input });
}
