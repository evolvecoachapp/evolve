import type { AthleteStateRef } from "../models/AthleteStateRef";
import type { SleepAdjustment } from "../models/SleepAdjustment";
import type { ReadinessAdjustment } from "../models/ReadinessAdjustment";
import type { CoachContextRef } from "../models/CoachContextRef";
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
import type { RecoveryAdaptationContext } from "../models/RecoveryAdaptationContext";
import type { RecoveryAdaptationDecisionRef } from "../models/RecoveryAdaptationDecisionRef";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { RecoveryAdaptationOutput } from "../models/RecoveryAdaptationOutput";
import type { RecoveryAdaptationState } from "../models/RecoveryAdaptationState";
import type { RecoveryAdjustment } from "../models/RecoveryAdjustment";
import type { RecoveryComparison } from "../models/RecoveryComparison";
import type { RecoveryDescriptor } from "../models/RecoveryDescriptor";
import type { RecoveryDiagnostics } from "../models/RecoveryDiagnostics";
import type { RecoveryHistory, RecoveryHistoryEntry } from "../models/RecoveryHistory";
import type { RecoveryMetadata } from "../models/RecoveryMetadata";
import type { RecoveryModification } from "../models/RecoveryModification";
import type { RecoveryPackage } from "../models/RecoveryPackage";
import type { RecoveryReplacement } from "../models/RecoveryReplacement";
import type { RecoveryResult } from "../models/RecoveryResult";
import type { RecoveryRuntimeInput } from "../models/RecoveryRuntimeInput";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { RecoveryStatistics } from "../models/RecoveryStatistics";
import type { RecoverySummary } from "../models/RecoverySummary";
import type { RecoveryTimeline, RecoveryTimelineItem } from "../models/RecoveryTimeline";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import type { PlanRef } from "../models/PlanRef";
import type { FatigueAdjustment } from "../models/FatigueAdjustment";
import type { DeloadAdjustment } from "../models/DeloadAdjustment";
import type { RuntimeRef } from "../models/RuntimeRef";
import type { StretchingAdjustment } from "../models/StretchingAdjustment";
import type { UpdatedRecoveryPlan } from "../models/UpdatedRecoveryPlan";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";

export function freezeMetadata(m: RecoveryMetadata): RecoveryMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezePlanRef(r: PlanRef): PlanRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeRuntimeRef(r: RuntimeRef): RuntimeRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeAthleteStateRef(r: AthleteStateRef): AthleteStateRef {
  return Object.freeze({ ...r, stateKeys: Object.freeze([...r.stateKeys]) });
}

export function freezeCoachContextRef(r: CoachContextRef): CoachContextRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeDecisionRef(r: RecoveryAdaptationDecisionRef): RecoveryAdaptationDecisionRef {
  return Object.freeze({
    ...r,
    decisionIds: Object.freeze([...r.decisionIds]),
    decisionKeys: Object.freeze([...r.decisionKeys]),
  });
}

export function freezeModification(m: RecoveryModification): RecoveryModification {
  return Object.freeze({
    ...m,
    sourceDecisionKeys: Object.freeze([...m.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...m.planStepKeys]),
    metadata: freezeMetadata(m.metadata),
  });
}

export function freezeAdjustment(a: RecoveryAdjustment): RecoveryAdjustment {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeReplacement(r: RecoveryReplacement): RecoveryReplacement {
  return Object.freeze({
    ...r,
    sourceDecisionKeys: Object.freeze([...r.sourceDecisionKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

function freezeKeyedAdjustment<T extends {
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
}>(a: T): T {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeRecoveryDayAdjustment(a: RecoveryDayAdjustment): RecoveryDayAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRecoveryDayReplacement(a: RecoveryDayReplacement): RecoveryDayReplacement {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}
export function freezeRecoveryDayRemoval(a: RecoveryDayRemoval): RecoveryDayRemoval {
  return freezeKeyedAdjustment(a);
}
export function freezeRecoveryDayInsertion(a: RecoveryDayInsertion): RecoveryDayInsertion {
  return freezeKeyedAdjustment(a);
}
export function freezeSleepAdjustment(a: SleepAdjustment): SleepAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFatigueAdjustment(a: FatigueAdjustment): FatigueAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeReadinessAdjustment(a: ReadinessAdjustment): ReadinessAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeHRVAdjustment(a: HRVAdjustment): HRVAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeCardioAdjustment(a: CardioAdjustment): CardioAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeStressAdjustment(a: StressAdjustment): StressAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeMobilityAdjustment(a: MobilityAdjustment): MobilityAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeStretchingAdjustment(a: StretchingAdjustment): StretchingAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeDeloadAdjustment(a: DeloadAdjustment): DeloadAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRecoveryProtocolAdjustment(a: RecoveryProtocolAdjustment): RecoveryProtocolAdjustment {
  return freezeKeyedAdjustment(a);
}

export function freezeWeeklyAdjustment(a: WeeklyAdjustment): WeeklyAdjustment {
  return freezeKeyedAdjustment(a);
}

export function freezeSnapshot(s: RecoverySnapshot): RecoverySnapshot {
  return Object.freeze({
    ...s,
    planKeys: Object.freeze([...s.planKeys]),
    dayKeys: Object.freeze([...s.dayKeys]),
    sleepKeys: Object.freeze([...s.sleepKeys]),
    protocolKeys: Object.freeze([...s.protocolKeys]),
    mobilityKeys: Object.freeze([...s.mobilityKeys]),
    weekKeys: Object.freeze([...s.weekKeys]),
    modificationIds: Object.freeze([...s.modificationIds]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeInput(i: RecoveryAdaptationInput): RecoveryAdaptationInput {
  return Object.freeze({
    ...i,
    planKeys: Object.freeze([...i.planKeys]),
    dayKeys: Object.freeze([...i.dayKeys]),
    sleepKeys: Object.freeze([...i.sleepKeys]),
    protocolKeys: Object.freeze([...i.protocolKeys]),
    mobilityKeys: Object.freeze([...i.mobilityKeys]),
    weekKeys: Object.freeze([...i.weekKeys]),
    decisionKeys: Object.freeze([...i.decisionKeys]),
    signalKeys: Object.freeze([...i.signalKeys]),
    signalFlags: Object.freeze({ ...i.signalFlags }),
    priorSnapshot: i.priorSnapshot ? freezeSnapshot(i.priorSnapshot) : null,
    decisionRef: i.decisionRef ? freezeDecisionRef(i.decisionRef) : null,
    planRef: i.planRef ? freezePlanRef(i.planRef) : null,
    runtimeRef: i.runtimeRef ? freezeRuntimeRef(i.runtimeRef) : null,
    athleteStateRef: i.athleteStateRef ? freezeAthleteStateRef(i.athleteStateRef) : null,
    coachContextRef: i.coachContextRef ? freezeCoachContextRef(i.coachContextRef) : null,
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeContext(c: RecoveryAdaptationContext): RecoveryAdaptationContext {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    planRef: c.planRef ? freezePlanRef(c.planRef) : null,
    runtimeRef: c.runtimeRef ? freezeRuntimeRef(c.runtimeRef) : null,
    athleteStateRef: c.athleteStateRef ? freezeAthleteStateRef(c.athleteStateRef) : null,
    coachContextRef: c.coachContextRef ? freezeCoachContextRef(c.coachContextRef) : null,
    decisionRef: c.decisionRef ? freezeDecisionRef(c.decisionRef) : null,
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeAdaptation(a: RecoveryAdaptation): RecoveryAdaptation {
  return Object.freeze({
    ...a,
    decisionKeys: Object.freeze([...a.decisionKeys]),
    signalKeys: Object.freeze([...a.signalKeys]),
    modifications: Object.freeze(a.modifications.map(freezeModification)),
    adjustments: Object.freeze(a.adjustments.map(freezeAdjustment)),
    replacements: Object.freeze(a.replacements.map(freezeReplacement)),
    recoveryDayAdjustments: Object.freeze(a.recoveryDayAdjustments.map(freezeRecoveryDayAdjustment)),
    recoveryDayReplacements: Object.freeze(a.recoveryDayReplacements.map(freezeRecoveryDayReplacement)),
    recoveryDayRemovals: Object.freeze(a.recoveryDayRemovals.map(freezeRecoveryDayRemoval)),
    recoveryDayInsertions: Object.freeze(a.recoveryDayInsertions.map(freezeRecoveryDayInsertion)),
    sleepAdjustments: Object.freeze(a.sleepAdjustments.map(freezeSleepAdjustment)),
    fatigueAdjustments: Object.freeze(a.fatigueAdjustments.map(freezeFatigueAdjustment)),
    readinessAdjustments: Object.freeze(a.readinessAdjustments.map(freezeReadinessAdjustment)),
    hrvAdjustments: Object.freeze(a.hrvAdjustments.map(freezeHRVAdjustment)),
    cardioAdjustments: Object.freeze(a.cardioAdjustments.map(freezeCardioAdjustment)),
    stressAdjustments: Object.freeze(a.stressAdjustments.map(freezeStressAdjustment)),
    mobilityAdjustments: Object.freeze(a.mobilityAdjustments.map(freezeMobilityAdjustment)),
    stretchingAdjustments: Object.freeze(a.stretchingAdjustments.map(freezeStretchingAdjustment)),
    deloadAdjustments: Object.freeze(a.deloadAdjustments.map(freezeDeloadAdjustment)),
    recoveryProtocolAdjustments: Object.freeze(a.recoveryProtocolAdjustments.map(freezeRecoveryProtocolAdjustment)),
    weeklyAdjustments: Object.freeze(a.weeklyAdjustments.map(freezeWeeklyAdjustment)),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeUpdatedPlan(b: UpdatedRecoveryPlan): UpdatedRecoveryPlan {
  return Object.freeze({
    ...b,
    dayKeys: Object.freeze([...b.dayKeys]),
    sleepKeys: Object.freeze([...b.sleepKeys]),
    protocolKeys: Object.freeze([...b.protocolKeys]),
    mobilityKeys: Object.freeze([...b.mobilityKeys]),
    weekKeys: Object.freeze([...b.weekKeys]),
    modificationIds: Object.freeze([...b.modificationIds]),
    metadata: freezeMetadata(b.metadata),
  });
}

export function freezeRuntimeInput(r: RecoveryRuntimeInput): RecoveryRuntimeInput {
  return Object.freeze({
    ...r,
    sleepKeys: Object.freeze([...r.sleepKeys]),
    protocolKeys: Object.freeze([...r.protocolKeys]),
    modificationIds: Object.freeze([...r.modificationIds]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeComparison(c: RecoveryComparison): RecoveryComparison {
  return Object.freeze({
    ...c,
    beforeKeys: Object.freeze([...c.beforeKeys]),
    afterKeys: Object.freeze([...c.afterKeys]),
    addedKeys: Object.freeze([...c.addedKeys]),
    removedKeys: Object.freeze([...c.removedKeys]),
    sharedKeys: Object.freeze([...c.sharedKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeHistoryEntry(e: RecoveryHistoryEntry): RecoveryHistoryEntry {
  return Object.freeze({ ...e, keys: Object.freeze([...e.keys]) });
}

export function freezeHistory(h: RecoveryHistory): RecoveryHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    historyKeys: Object.freeze([...h.historyKeys]),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeTimelineItem(i: RecoveryTimelineItem): RecoveryTimelineItem {
  return Object.freeze({ ...i, keys: Object.freeze([...i.keys]) });
}

export function freezeTimeline(t: RecoveryTimeline): RecoveryTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeSummary(s: RecoverySummary): RecoverySummary {
  return Object.freeze({
    ...s,
    decisionKeys: Object.freeze([...s.decisionKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeDiagnostics(d: RecoveryDiagnostics): RecoveryDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeStatistics(s: RecoveryStatistics): RecoveryStatistics {
  return Object.freeze({ ...s });
}

export function freezeDescriptor(d: RecoveryDescriptor): RecoveryDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: RecoveryValidation): RecoveryValidation {
  return Object.freeze({
    valid: v.valid,
    issues: Object.freeze([...v.issues]),
  });
}

export function freezePackage(p: RecoveryPackage): RecoveryPackage {
  return Object.freeze({
    ...p,
    adaptation: p.adaptation ? freezeAdaptation(p.adaptation) : null,
    updatedPlan: p.updatedPlan ? freezeUpdatedPlan(p.updatedPlan) : null,
    runtimeInput: p.runtimeInput ? freezeRuntimeInput(p.runtimeInput) : null,
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    comparison: p.comparison ? freezeComparison(p.comparison) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    history: p.history ? freezeHistory(p.history) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeOutput(o: RecoveryAdaptationOutput): RecoveryAdaptationOutput {
  return Object.freeze({
    ...o,
    adaptation: o.adaptation ? freezeAdaptation(o.adaptation) : null,
    updatedPlan: o.updatedPlan ? freezeUpdatedPlan(o.updatedPlan) : null,
    runtimeInput: o.runtimeInput ? freezeRuntimeInput(o.runtimeInput) : null,
    package: o.package ? freezePackage(o.package) : null,
    summary: o.summary ? freezeSummary(o.summary) : null,
    snapshot: o.snapshot ? freezeSnapshot(o.snapshot) : null,
  });
}

export function freezeState(s: RecoveryAdaptationState): RecoveryAdaptationState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    adaptation: s.adaptation ? freezeAdaptation(s.adaptation) : null,
  });
}

export function freezeResult(r: RecoveryResult): RecoveryResult {
  return Object.freeze({
    ...r,
    adaptation: r.adaptation ? freezeAdaptation(r.adaptation) : null,
    updatedPlan: r.updatedPlan ? freezeUpdatedPlan(r.updatedPlan) : null,
    runtimeInput: r.runtimeInput ? freezeRuntimeInput(r.runtimeInput) : null,
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    comparison: r.comparison ? freezeComparison(r.comparison) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}
