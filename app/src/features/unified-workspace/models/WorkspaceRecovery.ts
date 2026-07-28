import type { HomeRecoveryCard } from "../../home-experience/models/HomeRecoveryCard";

/**
 * Immutable recovery projection from Home recovery and Athlete State.
 */
export interface WorkspaceRecovery {
  readonly athleteId: string;
  readonly present: boolean;
  readonly card: HomeRecoveryCard | null;
  readonly status: string | null;
  readonly fatigueScore: number | null;
  readonly sleepLabel: string | null;
  readonly sleepHours: number | null;
  readonly signalSummaries: readonly string[];
  readonly summary: string;
}
