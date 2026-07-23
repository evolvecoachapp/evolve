import type { RecoveryContext } from "../models/RecoveryContext";
import { RecoveryIntents } from "../models/RecoveryIntent";
import {
  createDefaultPlanners,
  type RecoveryPlanner,
  DeloadPlanner,
  SleepPlanner,
  StressPlanner,
  ReadinessPlanner,
  FatiguePlanner,
  WellnessPlanner,
  RecoveryProtocolPlanner,
  RecoverySessionPlanner,
  TrainingLoadPlanner,
} from "../planning";

export class PlannerSelector {
  constructor(
    private readonly planners: readonly RecoveryPlanner[] = createDefaultPlanners(),
  ) {}

  select(context: RecoveryContext): RecoveryPlanner {
    switch (context.intent) {
      case RecoveryIntents.DELOAD_ADVICE:
        return DeloadPlanner;
      case RecoveryIntents.SLEEP_ADVICE:
        return SleepPlanner;
      case RecoveryIntents.STRESS_ADVICE:
        return StressPlanner;
      case RecoveryIntents.READINESS_CHECK:
        return ReadinessPlanner;
      case RecoveryIntents.FATIGUE_CHECK:
        return FatiguePlanner;
      case RecoveryIntents.WELLNESS_CHECK:
        return WellnessPlanner;
      case RecoveryIntents.ASSESS_RECOVERY:
        return RecoveryProtocolPlanner;
      case RecoveryIntents.PLAN_RECOVERY:
        if (context.goal === "active_recovery") return RecoverySessionPlanner;
        if (context.trainingLoad.score >= 70) return TrainingLoadPlanner;
        break;
      default:
        break;
    }
    if (context.constraints.prioritizeSleep) return SleepPlanner;
    if (context.constraints.prioritizeStress) return StressPlanner;
    return this.planners[0];
  }
}
