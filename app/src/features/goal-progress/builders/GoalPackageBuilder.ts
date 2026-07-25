import type { ContinuousAdaptationInput } from "../models/ContinuousAdaptationInput";
import type { GoalConstraint } from "../models/GoalConstraint";
import type { GoalDependency } from "../models/GoalDependency";
import type { GoalDiagnostics } from "../models/GoalDiagnostics";
import type { GoalHistory } from "../models/GoalHistory";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalPackage } from "../models/GoalPackage";
import type { GoalProgress } from "../models/GoalProgress";
import type { GoalSnapshot } from "../models/GoalSnapshot";
import type { GoalStatistics } from "../models/GoalStatistics";
import type { GoalSummary } from "../models/GoalSummary";
import type { GoalTimeline } from "../models/GoalTimeline";
import type { GoalTrend } from "../models/GoalTrend";
import { freezeDiagnostics, freezePackage } from "../utils/FreezeGoalProgress";

export function buildGoalPackage(input: {
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
  readonly processingSteps: readonly string[];
  readonly continuousAdaptationInput: ContinuousAdaptationInput | null;
  readonly dependencies?: readonly GoalDependency[];
  readonly constraints?: readonly GoalConstraint[];
  readonly at: string;
}): GoalPackage {
  const diagnostics: GoalDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["goal_progress_pipeline"]),
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
    continuousAdaptationInput: input.continuousAdaptationInput,
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
    constraints: Object.freeze([...(input.constraints ?? [])]),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: input.at,
  });
}
