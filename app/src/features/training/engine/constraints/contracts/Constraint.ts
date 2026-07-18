import type { ConstraintContext } from "../models/ConstraintContext";
import type { ConstraintResult } from "../models/ConstraintResult";

/**
 * A single, independently evaluable athlete limitation, preference, or
 * environmental restriction (e.g. available equipment, an excluded
 * exercise, a target muscle group). Every constraint has exactly one
 * responsibility and only evaluates its `ConstraintContext` — it never
 * mutates the context, the candidate exercise, or any other state — and its
 * result depends solely on its inputs, so evaluating the same context twice
 * always yields the same `ConstraintResult`. There is no randomness and no
 * dependency on any other constraint's outcome.
 *
 * New constraints are added by implementing this interface and registering
 * an instance with a `ConstraintEngine`; neither existing constraints nor
 * the engine itself need to change.
 */
export interface Constraint {
  /** Stable, human-readable identifier for this constraint (e.g. "equipment"). */
  readonly id: string;

  evaluate(context: ConstraintContext): ConstraintResult;
}
