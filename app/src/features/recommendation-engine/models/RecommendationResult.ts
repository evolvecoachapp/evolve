import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { ExplainabilityInput } from "./ExplainabilityInput";
import type { RecommendationDescriptor } from "./RecommendationDescriptor";
import type { RecommendationError } from "./RecommendationError";
import type { RecommendationPackage } from "./RecommendationPackage";
import type { RecommendationSnapshot } from "./RecommendationSnapshot";
import type { RecommendationSummary } from "./RecommendationSummary";
import type { RecommendationValidation } from "./RecommendationValidation";

export const RecommendationOperationKinds = {
  BUILD: "build",
  PRIORITIZE: "prioritize",
  PACKAGE: "package",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type RecommendationOperationKind =
  (typeof RecommendationOperationKinds)[keyof typeof RecommendationOperationKinds];

/**
 * Immutable result of a Recommendation Engine operation.
 */
export interface RecommendationResult {
  readonly id: string;
  readonly operation: RecommendationOperationKind;
  readonly success: boolean;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly package: RecommendationPackage | null;
  readonly summary: RecommendationSummary | null;
  readonly snapshot: RecommendationSnapshot | null;
  readonly explainabilityInput: ExplainabilityInput | null;
  readonly validation: RecommendationValidation | null;
  readonly descriptor: RecommendationDescriptor | null;
  readonly errors: readonly RecommendationError[];
  readonly createdAt: string;
}
