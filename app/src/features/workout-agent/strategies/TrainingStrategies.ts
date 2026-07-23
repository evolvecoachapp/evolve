import type { WorkoutStrategy } from "../models/WorkoutStrategy";
import { WorkoutObjectives } from "../models/WorkoutObjective";

export interface TrainingStrategy {
  readonly id: string;
  describe(): WorkoutStrategy;
  matches(objective: string): boolean;
}

export class StrengthStrategy implements TrainingStrategy {
  readonly id = "strategy:strength";

  describe(): WorkoutStrategy {
    return Object.freeze({
      id: this.id,
      name: "Strength",
      objective: WorkoutObjectives.STRENGTH,
      priority: 90,
      tags: Object.freeze(["strength", "low-rep"]),
      description: "Low-rep strength emphasis with compound lifts.",
    });
  }

  matches(objective: string): boolean {
    return objective === WorkoutObjectives.STRENGTH;
  }
}

export class HypertrophyStrategy implements TrainingStrategy {
  readonly id = "strategy:hypertrophy";

  describe(): WorkoutStrategy {
    return Object.freeze({
      id: this.id,
      name: "Hypertrophy",
      objective: WorkoutObjectives.HYPERTROPHY,
      priority: 85,
      tags: Object.freeze(["hypertrophy", "volume"]),
      description: "Moderate intensity with higher weekly volume.",
    });
  }

  matches(objective: string): boolean {
    return objective === WorkoutObjectives.HYPERTROPHY;
  }
}

export class PowerbuildingStrategy implements TrainingStrategy {
  readonly id = "strategy:powerbuilding";

  describe(): WorkoutStrategy {
    return Object.freeze({
      id: this.id,
      name: "Powerbuilding",
      objective: WorkoutObjectives.POWERBUILDING,
      priority: 80,
      tags: Object.freeze(["powerbuilding", "hybrid"]),
      description: "Blend of strength primaries and hypertrophy accessories.",
    });
  }

  matches(objective: string): boolean {
    return objective === WorkoutObjectives.POWERBUILDING;
  }
}

export class PowerliftingStrategy implements TrainingStrategy {
  readonly id = "strategy:powerlifting";

  describe(): WorkoutStrategy {
    return Object.freeze({
      id: this.id,
      name: "Powerlifting",
      objective: WorkoutObjectives.POWERLIFTING,
      priority: 95,
      tags: Object.freeze(["powerlifting", "competition"]),
      description: "Competition lift focus with peaking-friendly structure.",
    });
  }

  matches(objective: string): boolean {
    return objective === WorkoutObjectives.POWERLIFTING;
  }
}

export class GeneralFitnessStrategy implements TrainingStrategy {
  readonly id = "strategy:general_fitness";

  describe(): WorkoutStrategy {
    return Object.freeze({
      id: this.id,
      name: "General Fitness",
      objective: WorkoutObjectives.GENERAL_FITNESS,
      priority: 50,
      tags: Object.freeze(["general", "balanced"]),
      description: "Balanced full-body or upper/lower fitness programming.",
    });
  }

  matches(objective: string): boolean {
    return (
      objective === WorkoutObjectives.GENERAL_FITNESS ||
      objective === WorkoutObjectives.UNKNOWN ||
      objective === WorkoutObjectives.RECOVERY
    );
  }
}

export function createDefaultStrategies(): readonly TrainingStrategy[] {
  return Object.freeze([
    new StrengthStrategy(),
    new HypertrophyStrategy(),
    new PowerbuildingStrategy(),
    new PowerliftingStrategy(),
    new GeneralFitnessStrategy(),
  ]);
}
