import type { RecoveryGoal } from "../models/RecoveryGoal";
import type { RecoveryStrategy } from "../models/RecoveryStrategy";
import {
  createDefaultStrategies,
  type RecoveryStrategyImpl,
} from "../strategies";
import { freezeStrategy } from "../utils/FreezeRecoveryState";

export class StrategySelector {
  constructor(
    private readonly strategies: readonly RecoveryStrategyImpl[] = createDefaultStrategies(),
  ) {}

  select(goal: RecoveryGoal): RecoveryStrategy {
    const match =
      this.strategies.find((s) => s.matches(goal)) ??
      this.strategies[this.strategies.length - 1];
    return freezeStrategy(match.describe());
  }

  listIds(): readonly string[] {
    return Object.freeze(this.strategies.map((s) => s.id));
  }
}
