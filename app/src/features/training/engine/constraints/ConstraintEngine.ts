import type { Constraint } from "./contracts/Constraint";
import type { ConstraintEvaluator } from "./contracts/ConstraintEvaluator";
import type { ConstraintContext } from "./models/ConstraintContext";
import type { ConstraintResult } from "./models/ConstraintResult";
import { EquipmentConstraint } from "./rules/EquipmentConstraint";
import { ExcludedExerciseConstraint } from "./rules/ExcludedExerciseConstraint";
import { TargetMuscleConstraint } from "./rules/TargetMuscleConstraint";

const DEFAULT_CONSTRAINTS: readonly Constraint[] = [
  new EquipmentConstraint(),
  new ExcludedExerciseConstraint(),
  new TargetMuscleConstraint(),
];

/**
 * Default, deterministic implementation of `ConstraintEvaluator`.
 *
 * Every registered `Constraint` is evaluated independently against the
 * same `ConstraintContext` — no constraint's outcome depends on another's,
 * and no constraint is skipped once an earlier one fails — and their
 * individual `ConstraintResult`s are then aggregated into one final
 * decision: rejected if any constraint rejected, allowed otherwise, with
 * every warning and reason preserved in registration order.
 *
 * Constraints are supplied through the constructor rather than hard-coded,
 * so new constraints can be composed in (Open/Closed) without modifying
 * this class, and any caller that only knows about the `ConstraintEvaluator`
 * contract is unaffected by which constraints — or how many — are
 * registered (Dependency Inversion). There is no randomness anywhere in
 * this pipeline: identical inputs always produce an identical result.
 */
export class ConstraintEngine implements ConstraintEvaluator {
  private readonly constraints: readonly Constraint[];

  constructor(constraints: readonly Constraint[] = DEFAULT_CONSTRAINTS) {
    this.constraints = constraints;
  }

  evaluate(context: ConstraintContext): ConstraintResult {
    const results = this.constraints.map((constraint) => constraint.evaluate(context));
    return this.aggregate(results);
  }

  private aggregate(results: readonly ConstraintResult[]): ConstraintResult {
    const reasons = results.flatMap((result) => result.reasons);
    const warnings = results.flatMap((result) => result.warnings);
    const rejected = reasons.length > 0;

    return {
      allowed: !rejected,
      rejected,
      warnings,
      reasons,
    };
  }
}
