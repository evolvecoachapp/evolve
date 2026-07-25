import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationOutput } from "../models/RecommendationOutput";

/**
 * Structured export — no serialization side effects.
 */
export function exportRecommendationOutput(
  pkg: RecommendationPackage,
): RecommendationOutput {
  return Object.freeze({
    recommendations: pkg.recommendations,
    package: pkg,
    explainabilityInput: pkg.explainabilityInput,
  });
}
