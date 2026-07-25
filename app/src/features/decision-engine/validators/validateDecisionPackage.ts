import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionValidation } from "../models/DecisionValidation";
import { freezeValidation } from "../utils/FreezeDecisionState";
import { validateConflicts } from "./validateConflicts";
import { validateConsistency } from "./validateConsistency";
import { validateConstraints } from "./validateConstraints";
import { validateDecisionGraph } from "./validateDecisionGraph";
import { validateDecisionIntegrity } from "./validateDecisionIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validatePriorities } from "./validatePriorities";

export function validateDecisionPackage(
  pkg: DecisionPackage,
): DecisionValidation {
  const errors = [
    ...validateDecisionIntegrity(pkg.decisions),
    ...validateDependencies({
      candidates: pkg.candidates,
      dependencies: pkg.dependencies,
    }),
    ...validatePriorities(pkg.decisions),
    ...validateConflicts({
      conflicts: pkg.conflicts,
      resolutions: pkg.resolutions,
    }),
    ...validateConstraints(pkg.constraints),
    ...validateConsistency(pkg),
    ...validateDecisionGraph(pkg.graph),
  ];
  return freezeValidation({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([...pkg.diagnostics.warnings]),
  });
}
