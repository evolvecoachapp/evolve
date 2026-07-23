import type { WorkoutContext } from "../models/WorkoutContext";
import type { WorkoutReasoning } from "../models/WorkoutReasoning";
import { WorkoutReasoningTopics } from "../models/WorkoutReasoning";
import { freezeReasoning } from "../utils/freezeAgentState";

export interface WorkoutReasoner {
  readonly id: string;
  reason(context: WorkoutContext): WorkoutReasoning;
}

export class ExerciseReasoner implements WorkoutReasoner {
  readonly id = "reasoner:exercise";

  reason(context: WorkoutContext): WorkoutReasoning {
    const findings: string[] = [];
    if (context.objective === "powerlifting") {
      findings.push("Prioritize squat, bench, deadlift variations.");
    } else if (context.objective === "hypertrophy") {
      findings.push("Balance compounds with isolation accessories.");
    } else {
      findings.push("Prefer compound movements matching objective.");
    }
    if (context.experienceLevel === "beginner") {
      findings.push("Limit exercise variety; emphasize pattern mastery.");
    }
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.EXERCISE,
      findings: Object.freeze(findings),
      signals: Object.freeze({
        experience_rank:
          context.experienceLevel === "beginner"
            ? 1
            : context.experienceLevel === "advanced"
              ? 3
              : 2,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class ProgressionReasoner implements WorkoutReasoner {
  readonly id = "reasoner:progression";

  reason(context: WorkoutContext): WorkoutReasoning {
    const recovery =
      context.objective === "recovery" ||
      context.constraints.includes("needs_recovery");
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.PROGRESSION,
      findings: Object.freeze([
        recovery
          ? "Hold progression; favor deload or maintenance."
          : "Apply progressive overload when recovery allows.",
      ]),
      signals: Object.freeze({ recovery: recovery ? 1 : 0 }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class VolumeReasoner implements WorkoutReasoner {
  readonly id = "reasoner:volume";

  reason(context: WorkoutContext): WorkoutReasoning {
    const target =
      context.objective === "hypertrophy"
        ? 0.85
        : context.objective === "strength" ||
            context.objective === "powerlifting"
          ? 0.6
          : 0.7;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.VOLUME,
      findings: Object.freeze([
        `Target volume score near ${target} for ${context.objective}.`,
      ]),
      signals: Object.freeze({ volume_target: target }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class IntensityReasoner implements WorkoutReasoner {
  readonly id = "reasoner:intensity";

  reason(context: WorkoutContext): WorkoutReasoning {
    const target =
      context.objective === "powerlifting"
        ? 0.9
        : context.objective === "strength"
          ? 0.85
          : context.objective === "hypertrophy"
            ? 0.65
            : 0.55;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.INTENSITY,
      findings: Object.freeze([
        `Target intensity score near ${target} for ${context.objective}.`,
      ]),
      signals: Object.freeze({ intensity_target: target }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class FatigueReasoner implements WorkoutReasoner {
  readonly id = "reasoner:fatigue";

  reason(context: WorkoutContext): WorkoutReasoning {
    const fatigueProxy = Math.min(1, context.daysPerWeek / 6);
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.FATIGUE,
      findings: Object.freeze([
        fatigueProxy >= 0.85
          ? "High frequency may elevate fatigue — monitor recovery."
          : "Fatigue risk appears manageable at current frequency.",
      ]),
      signals: Object.freeze({ fatigue_proxy: fatigueProxy }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class FrequencyReasoner implements WorkoutReasoner {
  readonly id = "reasoner:frequency";

  reason(context: WorkoutContext): WorkoutReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.FREQUENCY,
      findings: Object.freeze([
        `Plan around ${context.daysPerWeek} training days per week.`,
      ]),
      signals: Object.freeze({ days_per_week: context.daysPerWeek }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class SplitReasoner implements WorkoutReasoner {
  readonly id = "reasoner:split";

  reason(context: WorkoutContext): WorkoutReasoning {
    const split =
      context.daysPerWeek <= 3
        ? "full_body"
        : context.daysPerWeek === 4
          ? "upper_lower"
          : context.objective === "hypertrophy"
            ? "push_pull_legs"
            : "upper_lower_hybrid";
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.SPLIT,
      findings: Object.freeze([`Suggested split: ${split}.`]),
      signals: Object.freeze({
        split_code:
          split === "full_body"
            ? 1
            : split === "upper_lower"
              ? 2
              : split === "push_pull_legs"
                ? 3
                : 4,
      }),
      notes: Object.freeze([split]),
    });
  }
}

export class GoalReasoner implements WorkoutReasoner {
  readonly id = "reasoner:goal";

  reason(context: WorkoutContext): WorkoutReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: WorkoutReasoningTopics.GOAL,
      findings: Object.freeze([
        `Primary objective resolved to ${context.objective}.`,
        `Intent: ${context.intent}.`,
      ]),
      signals: Object.freeze({
        objective_known: context.objective === "unknown" ? 0 : 1,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export function createDefaultReasoners(): readonly WorkoutReasoner[] {
  return Object.freeze([
    new GoalReasoner(),
    new ExerciseReasoner(),
    new ProgressionReasoner(),
    new VolumeReasoner(),
    new IntensityReasoner(),
    new FatigueReasoner(),
    new FrequencyReasoner(),
    new SplitReasoner(),
  ]);
}
