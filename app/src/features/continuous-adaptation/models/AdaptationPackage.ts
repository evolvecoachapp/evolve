import type { AdaptationConstraint } from "./AdaptationConstraint";
import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationDependency } from "./AdaptationDependency";
import type { AdaptationDiagnostics } from "./AdaptationDiagnostics";
import type { AdaptationHistory } from "./AdaptationHistory";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSnapshot } from "./AdaptationSnapshot";
import type { AdaptationStatistics } from "./AdaptationStatistics";
import type { AdaptationSummary } from "./AdaptationSummary";
import type { AdaptationTimeline } from "./AdaptationTimeline";
import type { AdaptationWindow } from "./AdaptationWindow";
import type { GoalProgressInput } from "./GoalProgressInput";
import type { NutritionAdaptationInput } from "./NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "./RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "./WorkoutAdaptationInput";

export interface AdaptationPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly summary: AdaptationSummary | null;
  readonly snapshot: AdaptationSnapshot | null;
  readonly timeline: AdaptationTimeline | null;
  readonly history: AdaptationHistory | null;
  readonly window: AdaptationWindow | null;
  readonly statistics: AdaptationStatistics;
  readonly diagnostics: AdaptationDiagnostics;
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
  readonly dependencies: readonly AdaptationDependency[];
  readonly constraints: readonly AdaptationConstraint[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
