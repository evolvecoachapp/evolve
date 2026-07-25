import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import type { AdaptationCondition } from "../models/AdaptationCondition";
import type { AdaptationConstraint } from "../models/AdaptationConstraint";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDependency } from "../models/AdaptationDependency";
import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationDiagnostics } from "../models/AdaptationDiagnostics";
import type { AdaptationEvaluation } from "../models/AdaptationEvaluation";
import type { AdaptationHistory, AdaptationHistoryEntry } from "../models/AdaptationHistory";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationMetadata } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import type { AdaptationOutput } from "../models/AdaptationOutput";
import type { AdaptationPackage } from "../models/AdaptationPackage";
import type { AdaptationPriority } from "../models/AdaptationPriority";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AdaptationReference } from "../models/AdaptationReference";
import type { AdaptationResult } from "../models/AdaptationResult";
import type { AdaptationSeverity } from "../models/AdaptationSeverity";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationState } from "../models/AdaptationState";
import type { AdaptationStatistics } from "../models/AdaptationStatistics";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import type { AdaptationTimeline, AdaptationTimelineItem } from "../models/AdaptationTimeline";
import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import type { AdaptationValidation } from "../models/AdaptationValidation";
import type { AdaptationWindow } from "../models/AdaptationWindow";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";

export function freezeMetadata(m: AdaptationMetadata): AdaptationMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezePriority(p: AdaptationPriority): AdaptationPriority {
  return Object.freeze({ ...p });
}

export function freezeSeverity(s: AdaptationSeverity): AdaptationSeverity {
  return Object.freeze({ ...s });
}

export function freezeReason(r: AdaptationReason): AdaptationReason {
  return Object.freeze({
    ...r,
    signalKeys: Object.freeze([...r.signalKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeTrigger(t: AdaptationTrigger): AdaptationTrigger {
  return Object.freeze({ ...t, metadata: freezeMetadata(t.metadata) });
}

export function freezeCondition(c: AdaptationCondition): AdaptationCondition {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeCandidate(c: AdaptationCandidate): AdaptationCandidate {
  return Object.freeze({
    ...c,
    triggerIds: Object.freeze([...c.triggerIds]),
    signalKeys: Object.freeze([...c.signalKeys]),
    priority: freezePriority(c.priority),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeOpportunity(o: AdaptationOpportunity): AdaptationOpportunity {
  return Object.freeze({
    ...o,
    candidateIds: Object.freeze([...o.candidateIds]),
    signalKeys: Object.freeze([...o.signalKeys]),
    severity: freezeSeverity(o.severity),
    metadata: freezeMetadata(o.metadata),
  });
}

export function freezeEvaluation(e: AdaptationEvaluation): AdaptationEvaluation {
  return Object.freeze({
    ...e,
    priority: freezePriority(e.priority),
    severity: freezeSeverity(e.severity),
    signalKeys: Object.freeze([...e.signalKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeDependency(d: AdaptationDependency): AdaptationDependency {
  return Object.freeze({ ...d, metadata: freezeMetadata(d.metadata) });
}

export function freezeConstraint(c: AdaptationConstraint): AdaptationConstraint {
  return Object.freeze({
    ...c,
    subjectKeys: Object.freeze([...c.subjectKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeReference(r: AdaptationReference): AdaptationReference {
  return Object.freeze({ ...r, metadata: freezeMetadata(r.metadata) });
}

export function freezeDecision(d: AdaptationDecision): AdaptationDecision {
  return Object.freeze({
    ...d,
    triggers: Object.freeze(d.triggers.map(freezeTrigger)),
    conditions: Object.freeze(d.conditions.map(freezeCondition)),
    candidates: Object.freeze(d.candidates.map(freezeCandidate)),
    opportunities: Object.freeze(d.opportunities.map(freezeOpportunity)),
    reasons: Object.freeze(d.reasons.map(freezeReason)),
    evaluation: freezeEvaluation(d.evaluation),
    priority: freezePriority(d.priority),
    severity: freezeSeverity(d.severity),
    dependencies: Object.freeze(d.dependencies.map(freezeDependency)),
    constraints: Object.freeze(d.constraints.map(freezeConstraint)),
    signalKeys: Object.freeze([...d.signalKeys]),
    sourceKeys: Object.freeze([...d.sourceKeys]),
    metadata: freezeMetadata(d.metadata),
  });
}

export function freezeSummary(s: AdaptationSummary): AdaptationSummary {
  return Object.freeze({
    ...s,
    categoryKeys: Object.freeze([...s.categoryKeys]),
    signalKeys: Object.freeze([...s.signalKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeSnapshot(s: AdaptationSnapshot): AdaptationSnapshot {
  return Object.freeze({
    ...s,
    decisions: Object.freeze(s.decisions.map(freezeDecision)),
    summary: s.summary ? freezeSummary(s.summary) : null,
    signalKeys: Object.freeze([...s.signalKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeTimelineItem(i: AdaptationTimelineItem): AdaptationTimelineItem {
  return Object.freeze({ ...i, metadata: freezeMetadata(i.metadata) });
}

export function freezeTimeline(t: AdaptationTimeline): AdaptationTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeHistoryEntry(e: AdaptationHistoryEntry): AdaptationHistoryEntry {
  return Object.freeze({
    ...e,
    signalKeys: Object.freeze([...e.signalKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeHistory(h: AdaptationHistory): AdaptationHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeWindow(w: AdaptationWindow): AdaptationWindow {
  return Object.freeze({
    ...w,
    itemIds: Object.freeze([...w.itemIds]),
    metadata: freezeMetadata(w.metadata),
  });
}

export function freezeStatistics(s: AdaptationStatistics): AdaptationStatistics {
  return Object.freeze({
    ...s,
    byCategory: Object.freeze({ ...s.byCategory }),
    bySeverity: Object.freeze({ ...s.bySeverity }),
  });
}

export function freezeDiagnostics(d: AdaptationDiagnostics): AdaptationDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeWorkoutHandoff(i: WorkoutAdaptationInput): WorkoutAdaptationInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeNutritionHandoff(i: NutritionAdaptationInput): NutritionAdaptationInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeRecoveryHandoff(i: RecoveryAdaptationInput): RecoveryAdaptationInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeGoalHandoff(i: GoalProgressInput): GoalProgressInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeContext(c: AdaptationContext): AdaptationContext {
  return Object.freeze({
    ...c,
    focusAreaKeys: Object.freeze([...c.focusAreaKeys]),
    stateKeys: Object.freeze([...c.stateKeys]),
    decisionIds: Object.freeze([...c.decisionIds]),
    recommendationIds: Object.freeze([...c.recommendationIds]),
    explanationIds: Object.freeze([...c.explanationIds]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezePackage(p: AdaptationPackage): AdaptationPackage {
  return Object.freeze({
    ...p,
    decisions: Object.freeze(p.decisions.map(freezeDecision)),
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    history: p.history ? freezeHistory(p.history) : null,
    window: p.window ? freezeWindow(p.window) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    workoutAdaptationInput: p.workoutAdaptationInput
      ? freezeWorkoutHandoff(p.workoutAdaptationInput)
      : null,
    nutritionAdaptationInput: p.nutritionAdaptationInput
      ? freezeNutritionHandoff(p.nutritionAdaptationInput)
      : null,
    recoveryAdaptationInput: p.recoveryAdaptationInput
      ? freezeRecoveryHandoff(p.recoveryAdaptationInput)
      : null,
    goalProgressInput: p.goalProgressInput ? freezeGoalHandoff(p.goalProgressInput) : null,
    dependencies: Object.freeze(p.dependencies.map(freezeDependency)),
    constraints: Object.freeze(p.constraints.map(freezeConstraint)),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeInput(i: AdaptationInput): AdaptationInput {
  return Object.freeze({
    ...i,
    decisions: Object.freeze([...i.decisions]),
    recommendations: Object.freeze([...i.recommendations]),
    explanations: Object.freeze([...i.explanations]),
    stateKeys: Object.freeze([...i.stateKeys]),
    performanceKeys: Object.freeze([...i.performanceKeys]),
    recoveryKeys: Object.freeze([...i.recoveryKeys]),
    nutritionKeys: Object.freeze([...i.nutritionKeys]),
    goalKeys: Object.freeze([...i.goalKeys]),
    adherenceKeys: Object.freeze([...i.adherenceKeys]),
    historyKeys: Object.freeze([...i.historyKeys]),
    timelineKeys: Object.freeze([...i.timelineKeys]),
    signalFlags: Object.freeze({ ...i.signalFlags }),
    priorSnapshot: i.priorSnapshot ? freezeSnapshot(i.priorSnapshot) : null,
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeOutput(o: AdaptationOutput): AdaptationOutput {
  return Object.freeze({
    decisions: Object.freeze(o.decisions.map(freezeDecision)),
    package: o.package ? freezePackage(o.package) : null,
    workoutAdaptationInput: o.workoutAdaptationInput
      ? freezeWorkoutHandoff(o.workoutAdaptationInput)
      : null,
    nutritionAdaptationInput: o.nutritionAdaptationInput
      ? freezeNutritionHandoff(o.nutritionAdaptationInput)
      : null,
    recoveryAdaptationInput: o.recoveryAdaptationInput
      ? freezeRecoveryHandoff(o.recoveryAdaptationInput)
      : null,
    goalProgressInput: o.goalProgressInput ? freezeGoalHandoff(o.goalProgressInput) : null,
  });
}

export function freezeResult(r: AdaptationResult): AdaptationResult {
  return Object.freeze({
    ...r,
    decisions: Object.freeze(r.decisions.map(freezeDecision)),
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    workoutAdaptationInput: r.workoutAdaptationInput
      ? freezeWorkoutHandoff(r.workoutAdaptationInput)
      : null,
    nutritionAdaptationInput: r.nutritionAdaptationInput
      ? freezeNutritionHandoff(r.nutritionAdaptationInput)
      : null,
    recoveryAdaptationInput: r.recoveryAdaptationInput
      ? freezeRecoveryHandoff(r.recoveryAdaptationInput)
      : null,
    goalProgressInput: r.goalProgressInput ? freezeGoalHandoff(r.goalProgressInput) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}

export function freezeState(s: AdaptationState): AdaptationState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    decisions: Object.freeze(s.decisions.map(freezeDecision)),
  });
}

export function freezeDescriptor(d: AdaptationDescriptor): AdaptationDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: AdaptationValidation): AdaptationValidation {
  return Object.freeze({ ...v, issues: Object.freeze([...v.issues]) });
}
