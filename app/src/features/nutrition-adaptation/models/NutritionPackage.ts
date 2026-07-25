import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionComparison } from "./NutritionComparison";
import type { NutritionDiagnostics } from "./NutritionDiagnostics";
import type { NutritionHistory } from "./NutritionHistory";
import type { NutritionMetadata } from "./NutritionMetadata";
import type { NutritionRuntimeInput } from "./NutritionRuntimeInput";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { NutritionStatistics } from "./NutritionStatistics";
import type { NutritionSummary } from "./NutritionSummary";
import type { NutritionTimeline } from "./NutritionTimeline";
import type { UpdatedNutritionPlan } from "./UpdatedNutritionPlan";

export interface NutritionPackage {
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
  readonly diagnostics: NutritionDiagnostics;
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
