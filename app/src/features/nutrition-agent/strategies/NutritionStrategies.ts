import type { NutritionStrategy } from "../models/NutritionStrategy";
import { NutritionGoals } from "../models/NutritionGoal";

export interface NutritionStrategyImpl {
  readonly id: string;
  describe(): NutritionStrategy;
  matches(goal: string): boolean;
}

export class FatLossStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:fat_loss";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Fat Loss",
      goal: NutritionGoals.FAT_LOSS,
      priority: 90,
      tags: Object.freeze(["cut", "deficit"]),
      description: "Calorie deficit with elevated protein for fat loss.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.FAT_LOSS;
  }
}

export class MuscleGainStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:muscle_gain";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Muscle Gain",
      goal: NutritionGoals.MUSCLE_GAIN,
      priority: 88,
      tags: Object.freeze(["bulk", "surplus"]),
      description: "Modest surplus to support muscle gain.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.MUSCLE_GAIN;
  }
}

export class MaintenanceStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:maintenance";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Maintenance",
      goal: NutritionGoals.MAINTENANCE,
      priority: 70,
      tags: Object.freeze(["maintain"]),
      description: "Energy balance near maintenance calories.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.MAINTENANCE;
  }
}

export class RecompositionStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:recomposition";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Recomposition",
      goal: NutritionGoals.RECOMPOSITION,
      priority: 80,
      tags: Object.freeze(["recomp"]),
      description: "Slight deficit or maintenance with high protein for recomp.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.RECOMPOSITION;
  }
}

export class PerformanceStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:performance";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Performance",
      goal: NutritionGoals.PERFORMANCE,
      priority: 85,
      tags: Object.freeze(["performance", "fueling"]),
      description: "Fueling strategy for training performance.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.PERFORMANCE;
  }
}

export class PowerliftingNutritionStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:powerlifting";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Powerlifting Nutrition",
      goal: NutritionGoals.POWERLIFTING,
      priority: 92,
      tags: Object.freeze(["powerlifting"]),
      description: "Strength-supportive calories and carbs around sessions.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.POWERLIFTING;
  }
}

export class HypertrophyNutritionStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:hypertrophy";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Hypertrophy Nutrition",
      goal: NutritionGoals.HYPERTROPHY,
      priority: 87,
      tags: Object.freeze(["hypertrophy"]),
      description: "Surplus and protein to support hypertrophy training.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.HYPERTROPHY;
  }
}

export class GeneralHealthStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:general_health";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "General Health",
      goal: NutritionGoals.GENERAL_HEALTH,
      priority: 50,
      tags: Object.freeze(["health", "balanced"]),
      description: "Balanced intake for general health.",
    });
  }
  matches(goal: string): boolean {
    return (
      goal === NutritionGoals.GENERAL_HEALTH ||
      goal === NutritionGoals.UNKNOWN
    );
  }
}

export class ContestPrepStrategy implements NutritionStrategyImpl {
  readonly id = "strategy:nutrition:contest_prep";
  describe(): NutritionStrategy {
    return Object.freeze({
      id: this.id,
      name: "Contest Prep",
      goal: NutritionGoals.CONTEST_PREP,
      priority: 95,
      tags: Object.freeze(["contest", "prep"]),
      description: "Aggressive but safety-floored deficit for contest prep.",
    });
  }
  matches(goal: string): boolean {
    return goal === NutritionGoals.CONTEST_PREP;
  }
}

export function createDefaultStrategies(): readonly NutritionStrategyImpl[] {
  return Object.freeze([
    new FatLossStrategy(),
    new MuscleGainStrategy(),
    new MaintenanceStrategy(),
    new RecompositionStrategy(),
    new PerformanceStrategy(),
    new PowerliftingNutritionStrategy(),
    new HypertrophyNutritionStrategy(),
    new ContestPrepStrategy(),
    new GeneralHealthStrategy(),
  ]);
}
