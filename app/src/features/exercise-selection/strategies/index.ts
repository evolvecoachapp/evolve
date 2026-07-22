import { ConstraintStrategy } from "./ConstraintStrategy";
import { DifficultyStrategy } from "./DifficultyStrategy";
import { EquipmentStrategy } from "./EquipmentStrategy";
import { GoalStrategy } from "./GoalStrategy";
import { MovementPatternStrategy } from "./MovementPatternStrategy";
import { RelationshipStrategy } from "./RelationshipStrategy";
import type { SelectionStrategy } from "./SelectionStrategy";

export type {
  SelectionStrategy,
  StrategyEvaluation,
} from "./SelectionStrategy";

export { MovementPatternStrategy } from "./MovementPatternStrategy";
export { EquipmentStrategy } from "./EquipmentStrategy";
export { DifficultyStrategy } from "./DifficultyStrategy";
export { GoalStrategy } from "./GoalStrategy";
export { ConstraintStrategy } from "./ConstraintStrategy";
export { RelationshipStrategy } from "./RelationshipStrategy";

/**
 * Default ordered strategy pipeline. Order affects only evaluation sequence
 * documentation — final scores are summed independently.
 */
export function createDefaultStrategies(): readonly SelectionStrategy[] {
  return Object.freeze([
    new MovementPatternStrategy(),
    new EquipmentStrategy(),
    new DifficultyStrategy(),
    new GoalStrategy(),
    new ConstraintStrategy(),
    new RelationshipStrategy(),
  ]);
}
