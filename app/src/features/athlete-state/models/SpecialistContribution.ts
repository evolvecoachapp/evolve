import type { AthleteConstraints } from "./AthleteConstraints";
import type { AthleteGoals } from "./AthleteGoals";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthletePreferences } from "./AthletePreferences";
import type { CoachingState } from "./CoachingState";
import type { FatigueState } from "./FatigueState";
import type { NutritionState } from "./NutritionState";
import type { PerformanceState } from "./PerformanceState";
import type { ProgressState } from "./ProgressState";
import type { ReadinessState } from "./ReadinessState";
import type { RecoveryState } from "./RecoveryState";
import type { SleepState } from "./SleepState";
import type { StressState } from "./StressState";
import type { TrainingState } from "./TrainingState";

export const SpecialistSources = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  SESSION: "session",
} as const;

export type SpecialistSource =
  (typeof SpecialistSources)[keyof typeof SpecialistSources];

/**
 * Lightweight immutable contribution from a specialist agent / session.
 * Aggregation copies declared slices only — no AI, no calculations.
 */
export interface SpecialistContribution {
  readonly id: string;
  readonly source: SpecialistSource;
  readonly agentId: string;
  readonly athleteId: string;
  readonly training: TrainingState | null;
  readonly recovery: RecoveryState | null;
  readonly nutrition: NutritionState | null;
  readonly performance: PerformanceState | null;
  readonly readiness: ReadinessState | null;
  readonly fatigue: FatigueState | null;
  readonly sleep: SleepState | null;
  readonly stress: StressState | null;
  readonly goals: AthleteGoals | null;
  readonly preferences: AthletePreferences | null;
  readonly constraints: AthleteConstraints | null;
  readonly progress: ProgressState | null;
  readonly coaching: CoachingState | null;
  readonly notes: readonly string[];
  readonly metadata: AthleteMetadata;
  readonly contributedAt: string;
}
