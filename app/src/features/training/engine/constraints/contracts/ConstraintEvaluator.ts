import type { ConstraintContext } from "../models/ConstraintContext";
import type { ConstraintResult } from "../models/ConstraintResult";

/**
 * Evaluates a `ConstraintContext` and produces a single, final
 * `ConstraintResult`. Contract only: this is the abstraction future
 * planners depend on, so they never need to know whether the decision came
 * from one constraint, many constraints aggregated together, or some other
 * evaluation strategy entirely — only that a `ConstraintEvaluator` was
 * injected. `ConstraintEngine` is the default implementation, but any other
 * implementation can be substituted without changing a planner (Dependency
 * Inversion).
 */
export interface ConstraintEvaluator {
  evaluate(context: ConstraintContext): ConstraintResult;
}
