export * from "./StressPlanner";
export * from "./DeloadPlanner";
export * from "./SleepPlanner";
export * from "./RecoveryPlanner";
export * from "./MobilityPlanner";
export * from "./WeekPlanner";

import { planStress, type StressPlan } from "./StressPlanner";
import { planDeload, type ProtocolPlan } from "./DeloadPlanner";
import { planSleep, type DayPlan } from "./SleepPlanner";
import { planRecovery, type RecoveryPlan } from "./RecoveryPlanner";
import { planMobility, type TimingPlan } from "./MobilityPlanner";
import { planWeeks, type WeekPlan } from "./WeekPlanner";

export interface RecoveryPlanBundle {
  readonly recovery: RecoveryPlan;
  readonly day: DayPlan;
  readonly protocol: ProtocolPlan;
  readonly timing: TimingPlan;
  readonly stress: StressPlan;
  readonly week: WeekPlan;
}

export function planRecoveryAdaptation(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly planKeys: readonly string[];
  readonly sleepKeys: readonly string[];
  readonly protocolKeys: readonly string[];
  readonly mobilityKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): RecoveryPlanBundle {
  return Object.freeze({
    recovery: planRecovery(input),
    day: planSleep(input),
    protocol: planDeload(input),
    timing: planMobility(input),
    stress: planStress(input),
    week: planWeeks(input),
  });
}
