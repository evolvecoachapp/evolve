import type { BodyMetrics } from "./BodyMetrics";
import type { CoachInsightSummary } from "./CoachInsightSummary";
import type { GoalProgress } from "./GoalProgress";
import type { NutritionProgress } from "./NutritionProgress";
import type { PersonalRecord } from "./PersonalRecord";
import type { RecoveryProgress } from "./RecoveryProgress";
import type { StrengthProgress } from "./StrengthProgress";
import type { TimeRange } from "./TimeRange";
import type { TrainingStreak } from "./TrainingStreak";
import type { VolumeProgress } from "./VolumeProgress";

export interface ProgressDashboard {
  readonly timeRange: TimeRange;
  readonly headline: string;
  readonly summary: string;
  readonly strength: StrengthProgress;
  readonly volume: VolumeProgress;
  readonly recovery: RecoveryProgress;
  readonly nutrition: NutritionProgress;
  readonly bodyMetrics: BodyMetrics;
  readonly coachInsights: readonly CoachInsightSummary[];
  readonly personalRecords: readonly PersonalRecord[];
  readonly trainingStreak: TrainingStreak;
  readonly goalProgress: GoalProgress;
  readonly detailsDestination: string | null;
}

export function createProgressDashboard(input: ProgressDashboard): ProgressDashboard {
  return Object.freeze({
    ...input,
    coachInsights: Object.freeze([...input.coachInsights]),
    personalRecords: Object.freeze([...input.personalRecords]),
  });
}
