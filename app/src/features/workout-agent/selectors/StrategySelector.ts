import type { WorkoutObjective } from "../models/WorkoutObjective";
import type { WorkoutStrategy } from "../models/WorkoutStrategy";
import {
  createDefaultStrategies,
  type TrainingStrategy,
} from "../strategies";
import { freezeStrategy } from "../utils/freezeAgentState";

export class StrategySelector {
  constructor(
    private readonly strategies: readonly TrainingStrategy[] = createDefaultStrategies(),
  ) {}

  select(objective: WorkoutObjective): WorkoutStrategy {
    const match =
      this.strategies.find((s) => s.matches(objective)) ??
      this.strategies[this.strategies.length - 1];
    return freezeStrategy(match.describe());
  }

  listIds(): readonly string[] {
    return Object.freeze(this.strategies.map((s) => s.id));
  }
}
