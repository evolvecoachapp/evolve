import type { RecoveryIntent } from "../models/RecoveryIntent";
import { RecoveryIntents } from "../models/RecoveryIntent";

export class IntentSelector {
  select(input: {
    readonly intentHint: RecoveryIntent | null;
    readonly message: string;
  }): RecoveryIntent {
    if (input.intentHint && input.intentHint !== RecoveryIntents.UNKNOWN) {
      return input.intentHint;
    }
    const m = input.message.toLowerCase();
    if (m.includes("deload")) return RecoveryIntents.DELOAD_ADVICE;
    if (m.includes("sleep")) return RecoveryIntents.SLEEP_ADVICE;
    if (m.includes("stress")) return RecoveryIntents.STRESS_ADVICE;
    if (m.includes("readiness") || m.includes("ready"))
      return RecoveryIntents.READINESS_CHECK;
    if (m.includes("fatigue") || m.includes("tired"))
      return RecoveryIntents.FATIGUE_CHECK;
    if (m.includes("wellness") || m.includes("sore"))
      return RecoveryIntents.WELLNESS_CHECK;
    if (m.includes("educat") || m.includes("explain"))
      return RecoveryIntents.RECOVERY_EDUCATION;
    if (m.includes("assess") || m.includes("status"))
      return RecoveryIntents.ASSESS_RECOVERY;
    if (m.includes("plan") || m.includes("recover"))
      return RecoveryIntents.PLAN_RECOVERY;
    return RecoveryIntents.UNKNOWN;
  }
}
