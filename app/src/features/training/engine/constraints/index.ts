/**
 * Public surface of the training Constraint Engine: contracts, models, and
 * the default rule-based constraints, plus the `ConstraintEngine` that
 * evaluates them. This is the reusable, central place where athlete
 * limitations, preferences, and environmental restrictions are evaluated
 * before any planner (exercise selection, volume, frequency, split,
 * progression) makes a decision.
 */
export type { Constraint } from "./contracts/Constraint";
export type { ConstraintEvaluator } from "./contracts/ConstraintEvaluator";
export type { ConstraintContext } from "./models/ConstraintContext";
export type { ConstraintResult } from "./models/ConstraintResult";
export { EquipmentConstraint } from "./rules/EquipmentConstraint";
export { ExcludedExerciseConstraint } from "./rules/ExcludedExerciseConstraint";
export { TargetMuscleConstraint } from "./rules/TargetMuscleConstraint";
export { ConstraintEngine } from "./ConstraintEngine";
