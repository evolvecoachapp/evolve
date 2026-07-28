import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { SnapshotState } from "../models/SnapshotState";

export interface BuildStateInput {
  readonly athleteId: string;
  readonly athleteState?: AthleteState | null;
  readonly goalProgress?: GoalProgress | null;
  readonly currentPhase?: string | null;
  readonly recoveryState?: string | null;
}

/**
 * Builds the athlete state projection using existing state and goal artifacts.
 */
export function buildState(input: BuildStateInput): SnapshotState {
  return Object.freeze({
    athleteId: input.athleteId,
    athleteState: input.athleteState ?? null,
    currentPhase: input.currentPhase ?? input.athleteState?.training.phase ?? null,
    goalProgress: input.goalProgress ?? null,
    goalCategory: input.goalProgress?.category ?? null,
    recoveryState:
      input.recoveryState ?? input.athleteState?.recovery.status ?? null,
    athleteStatus:
      input.athleteState?.status.kind ?? input.athleteState?.summary?.status ?? null,
  });
}
