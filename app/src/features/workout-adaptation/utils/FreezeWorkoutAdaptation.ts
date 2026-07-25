import type { AthleteStateRef } from "../models/AthleteStateRef";
import type { BlueprintRef } from "../models/BlueprintRef";
import type { CoachContextRef } from "../models/CoachContextRef";
import type { ExerciseAdjustment } from "../models/ExerciseAdjustment";
import type { ExerciseInsertion } from "../models/ExerciseInsertion";
import type { ExerciseRemoval } from "../models/ExerciseRemoval";
import type { ExerciseReplacement } from "../models/ExerciseReplacement";
import type { FatigueAdjustment } from "../models/FatigueAdjustment";
import type { FrequencyAdjustment } from "../models/FrequencyAdjustment";
import type { IntensityAdjustment } from "../models/IntensityAdjustment";
import type { LoadAdjustment } from "../models/LoadAdjustment";
import type { PlateauAdjustment } from "../models/PlateauAdjustment";
import type { ProgressionAdjustment } from "../models/ProgressionAdjustment";
import type { RecoveryAdjustment } from "../models/RecoveryAdjustment";
import type { RegressionAdjustment } from "../models/RegressionAdjustment";
import type { RepAdjustment } from "../models/RepAdjustment";
import type { RestAdjustment } from "../models/RestAdjustment";
import type { RuntimeRef } from "../models/RuntimeRef";
import type { SessionAdjustment } from "../models/SessionAdjustment";
import type { SetAdjustment } from "../models/SetAdjustment";
import type { TempoAdjustment } from "../models/TempoAdjustment";
import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { VolumeAdjustment } from "../models/VolumeAdjustment";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutAdaptationContext } from "../models/WorkoutAdaptationContext";
import type { WorkoutAdaptationDecisionRef } from "../models/WorkoutAdaptationDecisionRef";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import type { WorkoutAdaptationOutput } from "../models/WorkoutAdaptationOutput";
import type { WorkoutAdaptationState } from "../models/WorkoutAdaptationState";
import type { WorkoutAdjustment } from "../models/WorkoutAdjustment";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutDiagnostics } from "../models/WorkoutDiagnostics";
import type { WorkoutHistory, WorkoutHistoryEntry } from "../models/WorkoutHistory";
import type { WorkoutMetadata } from "../models/WorkoutMetadata";
import type { WorkoutModification } from "../models/WorkoutModification";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import type { WorkoutReplacement } from "../models/WorkoutReplacement";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutRuntimeInput } from "../models/WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import type { WorkoutStatistics } from "../models/WorkoutStatistics";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type { WorkoutTimeline, WorkoutTimelineItem } from "../models/WorkoutTimeline";
import type { WorkoutValidation } from "../models/WorkoutValidation";

export function freezeMetadata(m: WorkoutMetadata): WorkoutMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezeBlueprintRef(r: BlueprintRef): BlueprintRef {
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

export function freezeDecisionRef(r: WorkoutAdaptationDecisionRef): WorkoutAdaptationDecisionRef {
  return Object.freeze({
    ...r,
    decisionIds: Object.freeze([...r.decisionIds]),
    decisionKeys: Object.freeze([...r.decisionKeys]),
  });
}

export function freezeModification(m: WorkoutModification): WorkoutModification {
  return Object.freeze({
    ...m,
    sourceDecisionKeys: Object.freeze([...m.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...m.planStepKeys]),
    metadata: freezeMetadata(m.metadata),
  });
}

export function freezeAdjustment(a: WorkoutAdjustment): WorkoutAdjustment {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeReplacement(r: WorkoutReplacement): WorkoutReplacement {
  return Object.freeze({
    ...r,
    sourceDecisionKeys: Object.freeze([...r.sourceDecisionKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

function freezeKeyedAdjustment<T extends {
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
}>(a: T): T {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeExerciseAdjustment(a: ExerciseAdjustment): ExerciseAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeExerciseReplacement(a: ExerciseReplacement): ExerciseReplacement {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}
export function freezeExerciseRemoval(a: ExerciseRemoval): ExerciseRemoval {
  return freezeKeyedAdjustment(a);
}
export function freezeExerciseInsertion(a: ExerciseInsertion): ExerciseInsertion {
  return freezeKeyedAdjustment(a);
}
export function freezeSetAdjustment(a: SetAdjustment): SetAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRepAdjustment(a: RepAdjustment): RepAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeLoadAdjustment(a: LoadAdjustment): LoadAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeIntensityAdjustment(a: IntensityAdjustment): IntensityAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeVolumeAdjustment(a: VolumeAdjustment): VolumeAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRestAdjustment(a: RestAdjustment): RestAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeTempoAdjustment(a: TempoAdjustment): TempoAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFrequencyAdjustment(a: FrequencyAdjustment): FrequencyAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeWeeklyAdjustment(a: WeeklyAdjustment): WeeklyAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeProgressionAdjustment(a: ProgressionAdjustment): ProgressionAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRegressionAdjustment(a: RegressionAdjustment): RegressionAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezePlateauAdjustment(a: PlateauAdjustment): PlateauAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFatigueAdjustment(a: FatigueAdjustment): FatigueAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRecoveryAdjustment(a: RecoveryAdjustment): RecoveryAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeSessionAdjustment(a: SessionAdjustment): SessionAdjustment {
  return freezeKeyedAdjustment(a);
}

export function freezeSnapshot(s: WorkoutSnapshot): WorkoutSnapshot {
  return Object.freeze({
    ...s,
    blueprintKeys: Object.freeze([...s.blueprintKeys]),
    dayKeys: Object.freeze([...s.dayKeys]),
    exerciseKeys: Object.freeze([...s.exerciseKeys]),
    sessionKeys: Object.freeze([...s.sessionKeys]),
    weekKeys: Object.freeze([...s.weekKeys]),
    modificationIds: Object.freeze([...s.modificationIds]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeInput(i: WorkoutAdaptationInput): WorkoutAdaptationInput {
  return Object.freeze({
    ...i,
    blueprintKeys: Object.freeze([...i.blueprintKeys]),
    dayKeys: Object.freeze([...i.dayKeys]),
    exerciseKeys: Object.freeze([...i.exerciseKeys]),
    sessionKeys: Object.freeze([...i.sessionKeys]),
    weekKeys: Object.freeze([...i.weekKeys]),
    decisionKeys: Object.freeze([...i.decisionKeys]),
    signalKeys: Object.freeze([...i.signalKeys]),
    signalFlags: Object.freeze({ ...i.signalFlags }),
    priorSnapshot: i.priorSnapshot ? freezeSnapshot(i.priorSnapshot) : null,
    decisionRef: i.decisionRef ? freezeDecisionRef(i.decisionRef) : null,
    blueprintRef: i.blueprintRef ? freezeBlueprintRef(i.blueprintRef) : null,
    runtimeRef: i.runtimeRef ? freezeRuntimeRef(i.runtimeRef) : null,
    athleteStateRef: i.athleteStateRef ? freezeAthleteStateRef(i.athleteStateRef) : null,
    coachContextRef: i.coachContextRef ? freezeCoachContextRef(i.coachContextRef) : null,
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeContext(c: WorkoutAdaptationContext): WorkoutAdaptationContext {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    blueprintRef: c.blueprintRef ? freezeBlueprintRef(c.blueprintRef) : null,
    runtimeRef: c.runtimeRef ? freezeRuntimeRef(c.runtimeRef) : null,
    athleteStateRef: c.athleteStateRef ? freezeAthleteStateRef(c.athleteStateRef) : null,
    coachContextRef: c.coachContextRef ? freezeCoachContextRef(c.coachContextRef) : null,
    decisionRef: c.decisionRef ? freezeDecisionRef(c.decisionRef) : null,
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeAdaptation(a: WorkoutAdaptation): WorkoutAdaptation {
  return Object.freeze({
    ...a,
    decisionKeys: Object.freeze([...a.decisionKeys]),
    signalKeys: Object.freeze([...a.signalKeys]),
    modifications: Object.freeze(a.modifications.map(freezeModification)),
    adjustments: Object.freeze(a.adjustments.map(freezeAdjustment)),
    replacements: Object.freeze(a.replacements.map(freezeReplacement)),
    exerciseAdjustments: Object.freeze(a.exerciseAdjustments.map(freezeExerciseAdjustment)),
    exerciseReplacements: Object.freeze(a.exerciseReplacements.map(freezeExerciseReplacement)),
    exerciseRemovals: Object.freeze(a.exerciseRemovals.map(freezeExerciseRemoval)),
    exerciseInsertions: Object.freeze(a.exerciseInsertions.map(freezeExerciseInsertion)),
    setAdjustments: Object.freeze(a.setAdjustments.map(freezeSetAdjustment)),
    repAdjustments: Object.freeze(a.repAdjustments.map(freezeRepAdjustment)),
    loadAdjustments: Object.freeze(a.loadAdjustments.map(freezeLoadAdjustment)),
    intensityAdjustments: Object.freeze(a.intensityAdjustments.map(freezeIntensityAdjustment)),
    volumeAdjustments: Object.freeze(a.volumeAdjustments.map(freezeVolumeAdjustment)),
    restAdjustments: Object.freeze(a.restAdjustments.map(freezeRestAdjustment)),
    tempoAdjustments: Object.freeze(a.tempoAdjustments.map(freezeTempoAdjustment)),
    frequencyAdjustments: Object.freeze(a.frequencyAdjustments.map(freezeFrequencyAdjustment)),
    weeklyAdjustments: Object.freeze(a.weeklyAdjustments.map(freezeWeeklyAdjustment)),
    progressionAdjustments: Object.freeze(a.progressionAdjustments.map(freezeProgressionAdjustment)),
    regressionAdjustments: Object.freeze(a.regressionAdjustments.map(freezeRegressionAdjustment)),
    plateauAdjustments: Object.freeze(a.plateauAdjustments.map(freezePlateauAdjustment)),
    fatigueAdjustments: Object.freeze(a.fatigueAdjustments.map(freezeFatigueAdjustment)),
    recoveryAdjustments: Object.freeze(a.recoveryAdjustments.map(freezeRecoveryAdjustment)),
    sessionAdjustments: Object.freeze(a.sessionAdjustments.map(freezeSessionAdjustment)),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeUpdatedBlueprint(b: UpdatedWorkoutBlueprint): UpdatedWorkoutBlueprint {
  return Object.freeze({
    ...b,
    dayKeys: Object.freeze([...b.dayKeys]),
    exerciseKeys: Object.freeze([...b.exerciseKeys]),
    sessionKeys: Object.freeze([...b.sessionKeys]),
    weekKeys: Object.freeze([...b.weekKeys]),
    modificationIds: Object.freeze([...b.modificationIds]),
    metadata: freezeMetadata(b.metadata),
  });
}

export function freezeRuntimeInput(r: WorkoutRuntimeInput): WorkoutRuntimeInput {
  return Object.freeze({
    ...r,
    sessionKeys: Object.freeze([...r.sessionKeys]),
    exerciseKeys: Object.freeze([...r.exerciseKeys]),
    modificationIds: Object.freeze([...r.modificationIds]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeComparison(c: WorkoutComparison): WorkoutComparison {
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

export function freezeHistoryEntry(e: WorkoutHistoryEntry): WorkoutHistoryEntry {
  return Object.freeze({ ...e, keys: Object.freeze([...e.keys]) });
}

export function freezeHistory(h: WorkoutHistory): WorkoutHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    historyKeys: Object.freeze([...h.historyKeys]),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeTimelineItem(i: WorkoutTimelineItem): WorkoutTimelineItem {
  return Object.freeze({ ...i, keys: Object.freeze([...i.keys]) });
}

export function freezeTimeline(t: WorkoutTimeline): WorkoutTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeSummary(s: WorkoutSummary): WorkoutSummary {
  return Object.freeze({
    ...s,
    decisionKeys: Object.freeze([...s.decisionKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeDiagnostics(d: WorkoutDiagnostics): WorkoutDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeStatistics(s: WorkoutStatistics): WorkoutStatistics {
  return Object.freeze({ ...s });
}

export function freezeDescriptor(d: WorkoutDescriptor): WorkoutDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: WorkoutValidation): WorkoutValidation {
  return Object.freeze({
    valid: v.valid,
    issues: Object.freeze([...v.issues]),
  });
}

export function freezePackage(p: WorkoutPackage): WorkoutPackage {
  return Object.freeze({
    ...p,
    adaptation: p.adaptation ? freezeAdaptation(p.adaptation) : null,
    updatedBlueprint: p.updatedBlueprint ? freezeUpdatedBlueprint(p.updatedBlueprint) : null,
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

export function freezeOutput(o: WorkoutAdaptationOutput): WorkoutAdaptationOutput {
  return Object.freeze({
    ...o,
    adaptation: o.adaptation ? freezeAdaptation(o.adaptation) : null,
    updatedBlueprint: o.updatedBlueprint ? freezeUpdatedBlueprint(o.updatedBlueprint) : null,
    runtimeInput: o.runtimeInput ? freezeRuntimeInput(o.runtimeInput) : null,
    package: o.package ? freezePackage(o.package) : null,
    summary: o.summary ? freezeSummary(o.summary) : null,
    snapshot: o.snapshot ? freezeSnapshot(o.snapshot) : null,
  });
}

export function freezeState(s: WorkoutAdaptationState): WorkoutAdaptationState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    adaptation: s.adaptation ? freezeAdaptation(s.adaptation) : null,
  });
}

export function freezeResult(r: WorkoutResult): WorkoutResult {
  return Object.freeze({
    ...r,
    adaptation: r.adaptation ? freezeAdaptation(r.adaptation) : null,
    updatedBlueprint: r.updatedBlueprint ? freezeUpdatedBlueprint(r.updatedBlueprint) : null,
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
