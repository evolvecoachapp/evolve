import type { NutritionGoal } from "../models/NutritionGoal";
import type { NutritionStrategy } from "../models/NutritionStrategy";
import {
  createDefaultStrategies,
  type NutritionStrategyImpl,
} from "../strategies";
import { freezeStrategy } from "../utils/FreezeNutritionState";

export class StrategySelector {
  constructor(
    private readonly strategies: readonly NutritionStrategyImpl[] = createDefaultStrategies(),
  ) {}

  select(goal: NutritionGoal): NutritionStrategy {
    const match =
      this.strategies.find((s) => s.matches(goal)) ??
      this.strategies[this.strategies.length - 1];
    return freezeStrategy(match.describe());
  }

  listIds(): readonly string[] {
    return Object.freeze(this.strategies.map((s) => s.id));
  }
}
