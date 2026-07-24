import type { AthleteConstraints } from "./AthleteConstraints";
import type { AthleteGoals } from "./AthleteGoals";
import type { AthleteHistory } from "./AthleteHistory";
import type { AthleteIdentity } from "./AthleteIdentity";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteMetrics } from "./AthleteMetrics";
import type { AthletePreferences } from "./AthletePreferences";
import type { AthleteProfile } from "./AthleteProfile";
import type { AthleteStatistics } from "./AthleteStatistics";
import type { AthleteStatus } from "./AthleteStatus";
import type { AthleteTimeline } from "./AthleteTimeline";
import type { BodyComposition } from "./BodyComposition";
import type { BodyMeasurements } from "./BodyMeasurements";
import type { CoachingState } from "./CoachingState";
import type { DecisionHistory } from "./DecisionHistory";
import type { EnergyAvailability } from "./EnergyAvailability";
import type { FatigueState } from "./FatigueState";
import type { HealthIndicators } from "./HealthIndicators";
import type { HydrationState } from "./HydrationState";
import type { LifestyleState } from "./LifestyleState";
import type { NutritionState } from "./NutritionState";
import type { PerformanceState } from "./PerformanceState";
import type { ProgressState } from "./ProgressState";
import type { ReadinessState } from "./ReadinessState";
import type { RecoveryState } from "./RecoveryState";
import type { SleepState } from "./SleepState";
import type { StateDiagnostics } from "./StateDiagnostics";
import type { StateSummary } from "./StateSummary";
import type { StateVersion } from "./StateVersion";
import type { StressState } from "./StressState";
import type { TrainingState } from "./TrainingState";

/**
 * Immutable single source of truth for current athlete state.
 *
 * Aggregates physical / physiological / nutritional / recovery / coaching
 * representation. Performs no business calculations, AI reasoning, or persistence.
 */
export interface AthleteState {
  readonly id: string;
  readonly athleteId: string;
  readonly version: StateVersion;
  readonly identity: AthleteIdentity;
  readonly profile: AthleteProfile;
  readonly metrics: AthleteMetrics;
  readonly status: AthleteStatus;
  readonly bodyComposition: BodyComposition;
  readonly bodyMeasurements: BodyMeasurements;
  readonly training: TrainingState;
  readonly recovery: RecoveryState;
  readonly nutrition: NutritionState;
  readonly performance: PerformanceState;
  readonly lifestyle: LifestyleState;
  readonly health: HealthIndicators;
  readonly readiness: ReadinessState;
  readonly fatigue: FatigueState;
  readonly sleep: SleepState;
  readonly stress: StressState;
  readonly hydration: HydrationState;
  readonly energyAvailability: EnergyAvailability;
  readonly goals: AthleteGoals;
  readonly preferences: AthletePreferences;
  readonly constraints: AthleteConstraints;
  readonly progress: ProgressState;
  readonly coaching: CoachingState;
  readonly history: AthleteHistory;
  readonly timeline: AthleteTimeline;
  readonly statistics: AthleteStatistics;
  readonly decisionHistory: DecisionHistory;
  readonly diagnostics: StateDiagnostics;
  readonly summary: StateSummary | null;
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly frozenAt: string;
}
