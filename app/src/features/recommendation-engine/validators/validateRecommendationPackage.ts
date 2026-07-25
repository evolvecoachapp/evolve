import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationValidation } from "../models/RecommendationValidation";
import { freezeValidation } from "../utils/FreezeRecommendationState";
import { validateConflicts } from "./validateConflicts";
import { validateDependencies } from "./validateDependencies";
import { validateOrdering } from "./validateOrdering";
import { validateRecommendationIntegrity } from "./validateRecommendationIntegrity";
import { validateContextConsistency } from "./validateContextConsistency";

export function validateRecommendationPackage(
  pkg: RecommendationPackage,
): RecommendationValidation {
  const errors = Object.freeze([
    ...validateRecommendationIntegrity(pkg.recommendations),
    ...validateDependencies({
      recommendations: pkg.recommendations,
      dependencies: pkg.dependencies,
    }),
    ...validateConflicts(pkg.conflicts),
    ...validateOrdering(pkg.plan),
    ...validateContextConsistency(pkg),
  ]);
  const warnings: string[] = [];
  if (pkg.recommendations.length === 0) {
    warnings.push("empty_recommendations");
  }
  return freezeValidation({
    valid: errors.length === 0,
    errors,
    warnings: Object.freeze(warnings),
  });
}
