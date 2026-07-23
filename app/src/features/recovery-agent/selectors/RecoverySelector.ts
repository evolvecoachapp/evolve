import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryProtocolHint } from "../models/RecoveryPlan";

export class RecoverySelector {
  selectProtocol(context: RecoveryContext): RecoveryProtocolHint {
    if (context.constraints.prioritizeSleep) return "sleep_focus";
    if (context.constraints.prioritizeStress) return "stress_focus";
    if (context.indicators.recoveryScore < 40) return "rest";
    if (context.fatigue.level >= 70) return "deload";
    if (context.goal === "active_recovery") return "active";
    return "mixed";
  }
}
