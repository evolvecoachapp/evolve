import type { AthleteSnapshotCard } from "./AthleteSnapshotCard";
import type { CoachSummaryCard } from "./CoachSummaryCard";
import type { NutritionSummaryCard } from "./NutritionSummaryCard";
import type { QuickAction } from "./QuickAction";
import type { RecoverySummaryCard } from "./RecoverySummaryCard";
import type { WorkoutSummaryCard } from "./WorkoutSummaryCard";

/** Immutable Home operational dashboard read model. */
export interface HomeDashboard {
  readonly athlete: AthleteSnapshotCard;
  readonly workout: WorkoutSummaryCard;
  readonly nutrition: NutritionSummaryCard;
  readonly recovery: RecoverySummaryCard;
  readonly coach: CoachSummaryCard;
  readonly quickActions: readonly QuickAction[];
  readonly isEmpty: boolean;
}
