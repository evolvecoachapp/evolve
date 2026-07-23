import type { RecoveryGoal } from "../models/RecoveryGoal";
import type { RecoveryProtocolHint } from "../models/RecoveryPlan";

export class ProtocolSelector {
  select(goal: RecoveryGoal): RecoveryProtocolHint {
    switch (goal) {
      case "full_recovery":
        return "rest";
      case "active_recovery":
        return "active";
      case "sleep_optimization":
        return "sleep_focus";
      case "stress_reduction":
        return "stress_focus";
      case "fatigue_management":
        return "deload";
      default:
        return "mixed";
    }
  }
}
