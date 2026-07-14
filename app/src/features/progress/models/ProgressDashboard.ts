import type { BodyComposition } from "./BodyComposition";
import type { Milestone } from "./Milestone";
import type { MonthlyProgress } from "./MonthlyProgress";
import type { ProgressGoal } from "./ProgressGoal";
import type { ProgressStat } from "./ProgressStat";
import type { ProgressStatus } from "./ProgressStatus";
import type { StrengthProgress } from "./StrengthProgress";
import type { WeeklyProgress } from "./WeeklyProgress";

/** Primary read model for the Progress tab screen. */
export interface ProgressDashboard {
  stats: ProgressStat[];
  status: ProgressStatus;
  goal: ProgressGoal;
  weekly: WeeklyProgress;
  monthly: MonthlyProgress;
  bodyComposition: BodyComposition;
  strength: StrengthProgress;
  milestones: Milestone[];
}
