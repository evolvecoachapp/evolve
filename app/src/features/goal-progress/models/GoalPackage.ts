import type { ContinuousAdaptationInput } from "./ContinuousAdaptationInput";
import type { GoalConstraint } from "./GoalConstraint";
import type { GoalDependency } from "./GoalDependency";
import type { GoalDiagnostics } from "./GoalDiagnostics";
import type { GoalHistory } from "./GoalHistory";
import type { GoalMetadata } from "./GoalMetadata";
import type { GoalProgress } from "./GoalProgress";
import type { GoalSnapshot } from "./GoalSnapshot";
import type { GoalStatistics } from "./GoalStatistics";
import type { GoalSummary } from "./GoalSummary";
import type { GoalTimeline } from "./GoalTimeline";
import type { GoalTrend } from "./GoalTrend";

export interface GoalPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly GoalProgress[];
  readonly summary: GoalSummary | null;
  readonly snapshot: GoalSnapshot | null;
  readonly timeline: GoalTimeline | null;
  readonly history: GoalHistory | null;
  readonly window: GoalTrend | null;
  readonly statistics: GoalStatistics;
  readonly diagnostics: GoalDiagnostics;
  readonly continuousAdaptationInput: ContinuousAdaptationInput | null;
  readonly dependencies: readonly GoalDependency[];
  readonly constraints: readonly GoalConstraint[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}
