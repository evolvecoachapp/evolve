import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryReasoning } from "../models/RecoveryReasoning";
import { RecoveryReasoningTopics } from "../models/RecoveryReasoning";
import { freezeReasoning } from "../utils/FreezeRecoveryState";
import { buildDeloadRecommendation } from "../utils/RecoveryHelpers";

export interface RecoveryReasoner {
  readonly id: string;
  reason(context: RecoveryContext): RecoveryReasoning;
}

export class GoalReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:goal";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.GOAL,
      findings: Object.freeze([
        `Primary goal resolved to ${context.goal}.`,
        `Intent: ${context.intent}.`,
      ]),
      signals: Object.freeze({
        goal_known: context.goal === "unknown" ? 0 : 1,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class FatigueReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:fatigue";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.FATIGUE,
      findings: Object.freeze([
        `Fatigue level ${context.fatigue.level} (${context.fatigue.label}).`,
      ]),
      signals: Object.freeze({ fatigue_level: context.fatigue.level }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class ReadinessReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:readiness";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.READINESS,
      findings: Object.freeze([
        `Readiness score ${context.readiness.score} (${context.readiness.label}).`,
      ]),
      signals: Object.freeze({ readiness_score: context.readiness.score }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class SleepReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:sleep";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.SLEEP,
      findings: Object.freeze([
        `Sleep ~${context.sleep.hours}h quality ${context.sleep.quality} (${context.sleep.label}).`,
      ]),
      signals: Object.freeze({
        sleep_hours: context.sleep.hours,
        sleep_quality: context.sleep.quality,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class StressReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:stress";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.STRESS,
      findings: Object.freeze([
        `Stress level ${context.stress.level} (${context.stress.label}).`,
      ]),
      signals: Object.freeze({ stress_level: context.stress.level }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class TrainingLoadReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:training_load";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.TRAINING_LOAD,
      findings: Object.freeze([
        `Training load ${context.trainingLoad.score} (tolerance ${context.trainingLoad.tolerance}).`,
      ]),
      signals: Object.freeze({
        training_load: context.trainingLoad.score,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class DOMSReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:doms";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.DOMS,
      findings: Object.freeze([
        `Soreness / DOMS level ${context.indicators.sorenessLevel}.`,
      ]),
      signals: Object.freeze({
        soreness_level: context.indicators.sorenessLevel,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class RecoveryScoreReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:recovery_score";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.RECOVERY_SCORE,
      findings: Object.freeze([
        `Composite recovery score ${context.indicators.recoveryScore}.`,
      ]),
      signals: Object.freeze({
        recovery_score: context.indicators.recoveryScore,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class DeloadReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:deload";
  reason(context: RecoveryContext): RecoveryReasoning {
    const deload = buildDeloadRecommendation({
      recoveryScore: context.indicators.recoveryScore,
      fatigueLevel: context.fatigue.level,
      trainingLoadScore: context.trainingLoad.score,
      avoidDeload: context.constraints.avoidDeload,
    });
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.DELOAD,
      findings: Object.freeze([
        deload.recommended
          ? `Deload recommended (${deload.intensity}, ${deload.durationDays}d).`
          : "No deload indicated.",
      ]),
      signals: Object.freeze({
        deload_recommended: deload.recommended ? 1 : 0,
      }),
      notes: Object.freeze([deload.rationale]),
    });
  }
}

export class AdaptationReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:adaptation";
  reason(context: RecoveryContext): RecoveryReasoning {
    const adaptive =
      context.readiness.score >= 60 && context.fatigue.level < 60 ? 1 : 0;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.ADAPTATION,
      findings: Object.freeze([
        adaptive
          ? "Athlete appears ready for progressive loading."
          : "Favor recovery before further progressive overload.",
      ]),
      signals: Object.freeze({ adaptation_ready: adaptive }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class HRVReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:hrv";
  reason(context: RecoveryContext): RecoveryReasoning {
    const hrv = context.indicators.hrvScore;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.HRV,
      findings: Object.freeze([
        hrv == null
          ? "HRV not provided; using readiness as proxy."
          : `HRV score ${hrv}.`,
      ]),
      signals: Object.freeze({
        hrv_score: hrv ?? context.readiness.score,
        hrv_present: hrv == null ? 0 : 1,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class WellnessReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:wellness";
  reason(context: RecoveryContext): RecoveryReasoning {
    const wellness = Math.round(
      (context.indicators.recoveryScore +
        context.readiness.score +
        (100 - context.stress.level)) /
        3,
    );
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.WELLNESS,
      findings: Object.freeze([`Wellness composite ~${wellness}.`]),
      signals: Object.freeze({ wellness_score: wellness }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class RecoveryEducationReasoner implements RecoveryReasoner {
  readonly id = "reasoner:recovery:education";
  reason(context: RecoveryContext): RecoveryReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: RecoveryReasoningTopics.EDUCATION,
      findings: Object.freeze([
        "Recovery is multi-factorial: sleep, stress, load, and readiness interact.",
        `Current strategy focus: ${context.strategy?.name ?? "general wellness"}.`,
      ]),
      signals: Object.freeze({ education_priority: 1 }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export function createDefaultReasoners(): readonly RecoveryReasoner[] {
  return Object.freeze([
    new GoalReasoner(),
    new FatigueReasoner(),
    new ReadinessReasoner(),
    new SleepReasoner(),
    new StressReasoner(),
    new TrainingLoadReasoner(),
    new DOMSReasoner(),
    new RecoveryScoreReasoner(),
    new DeloadReasoner(),
    new AdaptationReasoner(),
    new HRVReasoner(),
    new WellnessReasoner(),
    new RecoveryEducationReasoner(),
  ]);
}
