import type { ReadinessLabel } from "../../recovery-agent/models/ReadinessState";

export interface ReadinessProgress {
  readonly score: number;
  readonly label: ReadinessLabel;
  readonly destination: string | null;
}

export function createReadinessProgress(input: ReadinessProgress): ReadinessProgress {
  return Object.freeze({ ...input });
}
