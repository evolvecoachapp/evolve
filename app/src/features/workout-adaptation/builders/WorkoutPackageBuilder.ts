import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import type { WorkoutDiagnostics } from "../models/WorkoutDiagnostics";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import type { WorkoutRuntimeInput } from "../models/WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import type { WorkoutStatistics } from "../models/WorkoutStatistics";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type { WorkoutTimeline } from "../models/WorkoutTimeline";
import { freezeDiagnostics, freezePackage } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutPackage(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput: WorkoutRuntimeInput | null;
  readonly summary: WorkoutSummary | null;
  readonly snapshot: WorkoutSnapshot | null;
  readonly comparison: WorkoutComparison | null;
  readonly timeline: WorkoutTimeline | null;
  readonly history: WorkoutHistory | null;
  readonly statistics: WorkoutStatistics;
  readonly processingSteps: readonly string[];
  readonly at: string;
}): WorkoutPackage {
  const diagnostics: WorkoutDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["workout_adaptation_pipeline"]),
    warnings: Object.freeze([] as string[]),
    processingSteps: Object.freeze([...input.processingSteps]),
  });
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    contextId: input.contextId,
    adaptation: input.adaptation,
    updatedBlueprint: input.updatedBlueprint,
    runtimeInput: input.runtimeInput,
    summary: input.summary,
    snapshot: input.snapshot,
    comparison: input.comparison,
    timeline: input.timeline,
    history: input.history,
    statistics: input.statistics,
    diagnostics,
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}
