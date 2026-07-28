import type { HomeWorkoutCard } from "../../home-experience/models/HomeWorkoutCard";

/**
 * Immutable workout projection from Home / Daily / Weekly workout artifacts.
 */
export interface WorkspaceWorkout {
  readonly athleteId: string;
  readonly present: boolean;
  readonly card: HomeWorkoutCard | null;
  readonly planId: string | null;
  readonly planName: string | null;
  readonly currentPhase: string | null;
  readonly planVersion: number | null;
  readonly summary: string;
}
