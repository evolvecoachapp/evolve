import type { SleepAdjustment } from "../models/SleepAdjustment";
import type { ReadinessAdjustment } from "../models/ReadinessAdjustment";
import type { RecoveryProtocolAdjustment } from "../models/RecoveryProtocolAdjustment";
import type { HRVAdjustment } from "../models/HRVAdjustment";
import type { CardioAdjustment } from "../models/CardioAdjustment";
import type { StressAdjustment } from "../models/StressAdjustment";
import type { RecoveryDayAdjustment } from "../models/RecoveryDayAdjustment";
import type { RecoveryDayInsertion } from "../models/RecoveryDayInsertion";
import type { RecoveryDayRemoval } from "../models/RecoveryDayRemoval";
import type { RecoveryDayReplacement } from "../models/RecoveryDayReplacement";
import type { MobilityAdjustment } from "../models/MobilityAdjustment";
import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import type { RecoveryAdjustment } from "../models/RecoveryAdjustment";
import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryModification } from "../models/RecoveryModification";
import { RecoveryModificationKinds } from "../models/RecoveryModification";
import type { RecoveryReplacement } from "../models/RecoveryReplacement";
import type { FatigueAdjustment } from "../models/FatigueAdjustment";
import type { DeloadAdjustment } from "../models/DeloadAdjustment";
import type { StretchingAdjustment } from "../models/StretchingAdjustment";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";
import { freezeAdaptation, freezeModification } from "../utils/FreezeRecoveryAdaptation";

export function buildRecoveryAdaptation(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly recoveryDayAdjustments?: readonly RecoveryDayAdjustment[];
  readonly sleepAdjustments?: readonly SleepAdjustment[];
  readonly fatigueAdjustments?: readonly FatigueAdjustment[];
  readonly readinessAdjustments?: readonly ReadinessAdjustment[];
  readonly hrvAdjustments?: readonly HRVAdjustment[];
  readonly cardioAdjustments?: readonly CardioAdjustment[];
  readonly stressAdjustments?: readonly StressAdjustment[];
  readonly mobilityAdjustments?: readonly MobilityAdjustment[];
  readonly stretchingAdjustments?: readonly StretchingAdjustment[];
  readonly deloadAdjustments?: readonly DeloadAdjustment[];
  readonly recoveryProtocolAdjustments?: readonly RecoveryProtocolAdjustment[];
  readonly weeklyAdjustments?: readonly WeeklyAdjustment[];
  readonly recoveryDayReplacements?: readonly RecoveryDayReplacement[];
  readonly recoveryDayRemovals?: readonly RecoveryDayRemoval[];
  readonly recoveryDayInsertions?: readonly RecoveryDayInsertion[];
  readonly at: string;
}): RecoveryAdaptation {
  const recoveryDayAdjustments = Object.freeze([...(input.recoveryDayAdjustments ?? [])]);
  const sleepAdjustments = Object.freeze([...(input.sleepAdjustments ?? [])]);
  const stressAdjustments = Object.freeze([...(input.stressAdjustments ?? [])]);
  const mobilityAdjustments = Object.freeze([...(input.mobilityAdjustments ?? [])]);
  const stretchingAdjustments = Object.freeze([...(input.stretchingAdjustments ?? [])]);
  const deloadAdjustments = Object.freeze([...(input.deloadAdjustments ?? [])]);
  const recoveryProtocolAdjustments = Object.freeze([...(input.recoveryProtocolAdjustments ?? [])]);
  const readinessAdjustments = Object.freeze([...(input.readinessAdjustments ?? [])]);
  const weeklyAdjustments = Object.freeze([...(input.weeklyAdjustments ?? [])]);

  const modifications: RecoveryModification[] = [];
  for (const adj of [
    ...recoveryDayAdjustments,
    ...sleepAdjustments,
    ...stressAdjustments,
    ...mobilityAdjustments,
    ...stretchingAdjustments,
    ...deloadAdjustments,
    ...recoveryProtocolAdjustments,
    ...readinessAdjustments,
    ...weeklyAdjustments,
  ]) {
    modifications.push(
      freezeModification({
        id: `mod:${adj.id}`,
        kind: RecoveryModificationKinds.ADJUSTMENT,
        targetKey: adj.targetKey,
        sourceDecisionKeys: adj.sourceDecisionKeys,
        planStepKeys: adj.planStepKeys,
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }

  const adjustments: readonly RecoveryAdjustment[] = Object.freeze(
    modifications.map((m) =>
      Object.freeze({
        id: `na:${m.id}`,
        targetKey: m.targetKey,
        adjustmentKey: m.id,
        sourceDecisionKeys: m.sourceDecisionKeys,
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    ),
  );

  const replacements: readonly RecoveryReplacement[] = Object.freeze([]);

  return freezeAdaptation({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    decisionKeys: Object.freeze([...input.decisionKeys]),
    signalKeys: Object.freeze([...input.signalKeys]),
    modifications: Object.freeze(modifications),
    adjustments,
    replacements,
    recoveryDayAdjustments,
    recoveryDayReplacements: Object.freeze([...(input.recoveryDayReplacements ?? [])]),
    recoveryDayRemovals: Object.freeze([...(input.recoveryDayRemovals ?? [])]),
    recoveryDayInsertions: Object.freeze([...(input.recoveryDayInsertions ?? [])]),
    sleepAdjustments,
    fatigueAdjustments: Object.freeze([...(input.fatigueAdjustments ?? [])]),
    readinessAdjustments: Object.freeze([...(input.readinessAdjustments ?? [])]),
    hrvAdjustments: Object.freeze([...(input.hrvAdjustments ?? [])]),
    cardioAdjustments: Object.freeze([...(input.cardioAdjustments ?? [])]),
    stressAdjustments,
    mobilityAdjustments,
    stretchingAdjustments,
    deloadAdjustments,
    recoveryProtocolAdjustments,
    weeklyAdjustments,
    metadata: EMPTY_RECOVERY_METADATA,
    createdAt: input.at,
  });
}
