import type { AdaptationConstraint } from "../models/AdaptationConstraint";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDependency } from "../models/AdaptationDependency";
import type { AdaptationDiagnostics } from "../models/AdaptationDiagnostics";
import type { AdaptationHistory } from "../models/AdaptationHistory";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationPackage } from "../models/AdaptationPackage";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationStatistics } from "../models/AdaptationStatistics";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import type { AdaptationWindow } from "../models/AdaptationWindow";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import { freezePackage, freezeDiagnostics } from "../utils/FreezeAdaptationState";

export function buildAdaptationPackage(input: {
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
  readonly processingSteps: readonly string[];
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
  readonly dependencies?: readonly AdaptationDependency[];
  readonly constraints?: readonly AdaptationConstraint[];
  readonly at: string;
}): AdaptationPackage {
  const diagnostics: AdaptationDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["continuous_adaptation_pipeline"]),
    warnings: Object.freeze([] as string[]),
    processingSteps: Object.freeze([...input.processingSteps]),
  });
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisions: input.decisions,
    summary: input.summary,
    snapshot: input.snapshot,
    timeline: input.timeline,
    history: input.history,
    window: input.window,
    statistics: input.statistics,
    diagnostics,
    workoutAdaptationInput: input.workoutAdaptationInput,
    nutritionAdaptationInput: input.nutritionAdaptationInput,
    recoveryAdaptationInput: input.recoveryAdaptationInput,
    goalProgressInput: input.goalProgressInput,
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
    constraints: Object.freeze([...(input.constraints ?? [])]),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
