import type { SleepLabel } from "../../recovery-agent/models/SleepProfile";

export interface SleepState {
  readonly hours: number;
  readonly quality: number;
  readonly label: SleepLabel;
  readonly logged: boolean;
  readonly destination: string | null;
}

export function createSleepState(input: SleepState): SleepState {
  return Object.freeze({ ...input });
}
