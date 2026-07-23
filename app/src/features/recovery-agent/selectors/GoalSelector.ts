import type { RecoveryGoal } from "../models/RecoveryGoal";
import { RecoveryGoals } from "../models/RecoveryGoal";
import type { RecoveryIntent } from "../models/RecoveryIntent";
import { RecoveryIntents } from "../models/RecoveryIntent";

export class GoalSelector {
  select(input: {
    readonly goalHint: RecoveryGoal | null;
    readonly intent: RecoveryIntent;
    readonly message: string;
  }): RecoveryGoal {
    if (input.goalHint && input.goalHint !== RecoveryGoals.UNKNOWN) {
      return input.goalHint;
    }
    const m = input.message.toLowerCase();
    if (m.includes("powerlift")) return RecoveryGoals.POWERLIFTING_RECOVERY;
    if (m.includes("hypertroph")) return RecoveryGoals.HYPERTROPHY_RECOVERY;
    if (m.includes("competition") || m.includes("meet"))
      return RecoveryGoals.COMPETITION_RECOVERY;
    if (m.includes("performance")) return RecoveryGoals.PERFORMANCE_RECOVERY;
    if (m.includes("active recovery") || m.includes("mobility"))
      return RecoveryGoals.ACTIVE_RECOVERY;
    if (m.includes("sleep")) return RecoveryGoals.SLEEP_OPTIMIZATION;
    if (m.includes("stress")) return RecoveryGoals.STRESS_REDUCTION;
    if (m.includes("fatigue")) return RecoveryGoals.FATIGUE_MANAGEMENT;
    if (m.includes("full rest") || m.includes("full recovery"))
      return RecoveryGoals.FULL_RECOVERY;
    if (input.intent === RecoveryIntents.SLEEP_ADVICE)
      return RecoveryGoals.SLEEP_OPTIMIZATION;
    if (input.intent === RecoveryIntents.STRESS_ADVICE)
      return RecoveryGoals.STRESS_REDUCTION;
    if (input.intent === RecoveryIntents.FATIGUE_CHECK)
      return RecoveryGoals.FATIGUE_MANAGEMENT;
    if (input.intent === RecoveryIntents.DELOAD_ADVICE)
      return RecoveryGoals.FATIGUE_MANAGEMENT;
    return RecoveryGoals.GENERAL_WELLNESS;
  }
}
