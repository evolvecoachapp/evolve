import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationError } from "../models/RecommendationError";
import type { RecommendationPackage } from "../models/RecommendationPackage";
import type {
  RecommendationOperationKind,
  RecommendationResult,
} from "../models/RecommendationResult";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import type { RecommendationValidation } from "../models/RecommendationValidation";
import { freezeResult } from "../utils/FreezeRecommendationState";

export function buildRecommendationResult(input: {
  readonly id: string;
  readonly operation: RecommendationOperationKind;
  readonly success: boolean;
  readonly recommendations?: readonly CoachingRecommendation[];
  readonly package?: RecommendationPackage | null;
  readonly summary?: RecommendationSummary | null;
  readonly snapshot?: RecommendationSnapshot | null;
  readonly explainabilityInput?: ExplainabilityInput | null;
  readonly validation?: RecommendationValidation | null;
  readonly descriptor?: RecommendationDescriptor | null;
  readonly errors?: readonly RecommendationError[];
  readonly createdAt: string;
}): RecommendationResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    recommendations: Object.freeze([...(input.recommendations ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    explainabilityInput: input.explainabilityInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
