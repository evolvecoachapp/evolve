import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionComparison } from "../models/NutritionComparison";
import type { NutritionDiagnostics } from "../models/NutritionDiagnostics";
import type { NutritionHistory } from "../models/NutritionHistory";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionPackage } from "../models/NutritionPackage";
import type { NutritionRuntimeInput } from "../models/NutritionRuntimeInput";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { NutritionStatistics } from "../models/NutritionStatistics";
import type { NutritionSummary } from "../models/NutritionSummary";
import type { NutritionTimeline } from "../models/NutritionTimeline";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import { freezeDiagnostics, freezePackage } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionPackage(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly runtimeInput: NutritionRuntimeInput | null;
  readonly summary: NutritionSummary | null;
  readonly snapshot: NutritionSnapshot | null;
  readonly comparison: NutritionComparison | null;
  readonly timeline: NutritionTimeline | null;
  readonly history: NutritionHistory | null;
  readonly statistics: NutritionStatistics;
  readonly processingSteps: readonly string[];
  readonly at: string;
}): NutritionPackage {
  const diagnostics: NutritionDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["nutrition_adaptation_pipeline"]),
    warnings: Object.freeze([] as string[]),
    processingSteps: Object.freeze([...input.processingSteps]),
  });
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptation: input.adaptation,
    updatedPlan: input.updatedPlan,
    runtimeInput: input.runtimeInput,
    summary: input.summary,
    snapshot: input.snapshot,
    comparison: input.comparison,
    timeline: input.timeline,
    history: input.history,
    statistics: input.statistics,
    diagnostics,
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}
