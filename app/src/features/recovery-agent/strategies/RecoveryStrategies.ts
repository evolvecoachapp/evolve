import type { RecoveryStrategy } from "../models/RecoveryStrategy";
import { RecoveryGoals } from "../models/RecoveryGoal";

export interface RecoveryStrategyImpl {
  readonly id: string;
  describe(): RecoveryStrategy;
  matches(goal: string): boolean;
}

export class FullRecoveryStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:full_recovery";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Full Recovery",
      goal: RecoveryGoals.FULL_RECOVERY,
      priority: 95,
      tags: Object.freeze(["rest", "restore"]),
      description: "Prioritize rest and restoration when recovery is low.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.FULL_RECOVERY;
  }
}

export class ActiveRecoveryStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:active_recovery";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Active Recovery",
      goal: RecoveryGoals.ACTIVE_RECOVERY,
      priority: 85,
      tags: Object.freeze(["active", "mobility"]),
      description: "Light movement to promote recovery without high load.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.ACTIVE_RECOVERY;
  }
}

export class SleepOptimizationStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:sleep_optimization";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Sleep Optimization",
      goal: RecoveryGoals.SLEEP_OPTIMIZATION,
      priority: 90,
      tags: Object.freeze(["sleep"]),
      description: "Focus on sleep duration and quality for recovery.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.SLEEP_OPTIMIZATION;
  }
}

export class FatigueManagementStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:fatigue_management";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Fatigue Management",
      goal: RecoveryGoals.FATIGUE_MANAGEMENT,
      priority: 88,
      tags: Object.freeze(["fatigue"]),
      description: "Manage accumulated fatigue and restore capacity.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.FATIGUE_MANAGEMENT;
  }
}

export class StressReductionStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:stress_reduction";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Stress Reduction",
      goal: RecoveryGoals.STRESS_REDUCTION,
      priority: 87,
      tags: Object.freeze(["stress"]),
      description: "Reduce perceived stress to improve recovery markers.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.STRESS_REDUCTION;
  }
}

export class PerformanceRecoveryStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:performance_recovery";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Performance Recovery",
      goal: RecoveryGoals.PERFORMANCE_RECOVERY,
      priority: 86,
      tags: Object.freeze(["performance"]),
      description: "Recover while protecting performance capacity.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.PERFORMANCE_RECOVERY;
  }
}

export class PowerliftingRecoveryStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:powerlifting_recovery";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Powerlifting Recovery",
      goal: RecoveryGoals.POWERLIFTING_RECOVERY,
      priority: 84,
      tags: Object.freeze(["powerlifting"]),
      description: "Recovery tactics suited to high-intensity strength work.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.POWERLIFTING_RECOVERY;
  }
}

export class HypertrophyRecoveryStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:hypertrophy_recovery";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Hypertrophy Recovery",
      goal: RecoveryGoals.HYPERTROPHY_RECOVERY,
      priority: 83,
      tags: Object.freeze(["hypertrophy"]),
      description: "Manage volume fatigue typical of hypertrophy blocks.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.HYPERTROPHY_RECOVERY;
  }
}

export class CompetitionRecoveryStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:competition_recovery";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "Competition Recovery",
      goal: RecoveryGoals.COMPETITION_RECOVERY,
      priority: 92,
      tags: Object.freeze(["competition", "peak"]),
      description: "Recovery around competition or peaking phases.",
    });
  }
  matches(goal: string): boolean {
    return goal === RecoveryGoals.COMPETITION_RECOVERY;
  }
}

export class GeneralWellnessStrategy implements RecoveryStrategyImpl {
  readonly id = "strategy:recovery:general_wellness";
  describe(): RecoveryStrategy {
    return Object.freeze({
      id: this.id,
      name: "General Wellness",
      goal: RecoveryGoals.GENERAL_WELLNESS,
      priority: 50,
      tags: Object.freeze(["wellness", "default"]),
      description: "Balanced recovery guidance for general wellness.",
    });
  }
  matches(goal: string): boolean {
    return (
      goal === RecoveryGoals.GENERAL_WELLNESS || goal === RecoveryGoals.UNKNOWN
    );
  }
}

export function createDefaultStrategies(): readonly RecoveryStrategyImpl[] {
  return Object.freeze([
    new FullRecoveryStrategy(),
    new ActiveRecoveryStrategy(),
    new SleepOptimizationStrategy(),
    new FatigueManagementStrategy(),
    new StressReductionStrategy(),
    new PerformanceRecoveryStrategy(),
    new PowerliftingRecoveryStrategy(),
    new HypertrophyRecoveryStrategy(),
    new CompetitionRecoveryStrategy(),
    new GeneralWellnessStrategy(),
  ]);
}
