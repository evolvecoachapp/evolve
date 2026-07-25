import type { ExplanationPackage } from "../models/ExplanationPackage";
import type { ExplanationValidation } from "../models/ExplanationValidation";
import { freezeValidation } from "../utils/FreezeExplanationState";
import { validateDecisionLinks } from "./validateDecisionLinks";
import { validateDependencies } from "./validateDependencies";
import { validateEvidenceConsistency } from "./validateEvidenceConsistency";
import { validateExplanationIntegrity } from "./validateExplanationIntegrity";
import { validateGraphIntegrity } from "./validateGraphIntegrity";
import { validateRecommendationLinks } from "./validateRecommendationLinks";
import { validateSnapshot } from "./validateSnapshot";
import { validateTraceConsistency } from "./validateTraceConsistency";

export * from "./validateDecisionLinks";
export * from "./validateDependencies";
export * from "./validateEvidenceConsistency";
export * from "./validateExplanationIntegrity";
export * from "./validateGraphIntegrity";
export * from "./validateRecommendationLinks";
export * from "./validateSnapshot";
export * from "./validateTraceConsistency";

export function validateExplanationPackage(
  pkg: ExplanationPackage,
): ExplanationValidation {
  const issues = Object.freeze([
    ...validateExplanationIntegrity(pkg.explanations),
    ...validateEvidenceConsistency(pkg.explanations),
    ...validateDecisionLinks(pkg.explanations),
    ...validateRecommendationLinks(pkg.explanations),
    ...validateGraphIntegrity(pkg.graph),
    ...validateTraceConsistency(pkg.trace),
    ...validateDependencies(pkg.dependencies),
    ...validateSnapshot(pkg.snapshot),
  ]);
  return freezeValidation({ valid: issues.length === 0, issues });
}
