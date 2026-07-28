import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";

/**
 * Immutable projection of the athlete's current state inputs.
 */
export interface SnapshotState {
  readonly athleteId: string;
  readonly athleteState: AthleteState | null;
  readonly currentPhase: string | null;
  readonly goalProgress: GoalProgress | null;
  readonly goalCategory: string | null;
  readonly recoveryState: string | null;
  readonly athleteStatus: string | null;
}
