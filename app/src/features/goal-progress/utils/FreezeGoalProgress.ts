import type { GoalCheckpoint } from "../models/GoalCheckpoint";
import type { GoalDeviation } from "../models/GoalDeviation";
import type { GoalConstraint } from "../models/GoalConstraint";
import type { GoalProgressContext } from "../models/GoalProgressContext";
import type { GoalProgress } from "../models/GoalProgress";
import type { GoalDependency } from "../models/GoalDependency";
import type { GoalDescriptor } from "../models/GoalDescriptor";
import type { GoalDiagnostics } from "../models/GoalDiagnostics";
import type { GoalEvaluation } from "../models/GoalEvaluation";
import type { GoalHistory, GoalHistoryEntry } from "../models/GoalHistory";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { GoalMetadata } from "../models/GoalMetadata";
import type { GoalMilestone } from "../models/GoalMilestone";
import type { GoalProgressOutput } from "../models/GoalProgressOutput";
import type { GoalPackage } from "../models/GoalPackage";
import type { GoalPriority } from "../models/GoalPriority";
import type { GoalConfidence } from "../models/GoalConfidence";
import type { GoalReference } from "../models/GoalReference";
import type { GoalResult } from "../models/GoalResult";
import type { GoalRisk } from "../models/GoalRisk";
import type { GoalSnapshot } from "../models/GoalSnapshot";
import type { GoalProgressState } from "../models/GoalProgressState";
import type { GoalStatistics } from "../models/GoalStatistics";
import type { GoalSummary } from "../models/GoalSummary";
import type { GoalTimeline, GoalTimelineItem } from "../models/GoalTimeline";
import type { GoalAchievement } from "../models/GoalAchievement";
import type { GoalValidation } from "../models/GoalValidation";
import type { GoalTrend } from "../models/GoalTrend";
import type { ContinuousAdaptationInput } from "../models/ContinuousAdaptationInput";

export function freezeMetadata(m: GoalMetadata): GoalMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezePriority(p: GoalPriority): GoalPriority {
  return Object.freeze({ ...p });
}

export function freezeSeverity(s: GoalRisk): GoalRisk {
  return Object.freeze({ ...s });
}

export function freezeReason(r: GoalConfidence): GoalConfidence {
  return Object.freeze({
    ...r,
    signalKeys: Object.freeze([...r.signalKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeTrigger(t: GoalAchievement): GoalAchievement {
  return Object.freeze({ ...t, metadata: freezeMetadata(t.metadata) });
}

export function freezeCondition(c: GoalDeviation): GoalDeviation {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeCandidate(c: GoalCheckpoint): GoalCheckpoint {
  return Object.freeze({
    ...c,
    triggerIds: Object.freeze([...c.triggerIds]),
    signalKeys: Object.freeze([...c.signalKeys]),
    priority: freezePriority(c.priority),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeOpportunity(o: GoalMilestone): GoalMilestone {
  return Object.freeze({
    ...o,
    candidateIds: Object.freeze([...o.candidateIds]),
    signalKeys: Object.freeze([...o.signalKeys]),
    severity: freezeSeverity(o.severity),
    metadata: freezeMetadata(o.metadata),
  });
}

export function freezeEvaluation(e: GoalEvaluation): GoalEvaluation {
  return Object.freeze({
    ...e,
    priority: freezePriority(e.priority),
    severity: freezeSeverity(e.severity),
    signalKeys: Object.freeze([...e.signalKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeDependency(d: GoalDependency): GoalDependency {
  return Object.freeze({ ...d, metadata: freezeMetadata(d.metadata) });
}

export function freezeConstraint(c: GoalConstraint): GoalConstraint {
  return Object.freeze({
    ...c,
    subjectKeys: Object.freeze([...c.subjectKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeReference(r: GoalReference): GoalReference {
  return Object.freeze({ ...r, metadata: freezeMetadata(r.metadata) });
}

export function freezeDecision(d: GoalProgress): GoalProgress {
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

export function freezeSummary(s: GoalSummary): GoalSummary {
  return Object.freeze({
    ...s,
    categoryKeys: Object.freeze([...s.categoryKeys]),
    signalKeys: Object.freeze([...s.signalKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeSnapshot(s: GoalSnapshot): GoalSnapshot {
  return Object.freeze({
    ...s,
    decisions: Object.freeze(s.decisions.map(freezeDecision)),
    summary: s.summary ? freezeSummary(s.summary) : null,
    signalKeys: Object.freeze([...s.signalKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeTimelineItem(i: GoalTimelineItem): GoalTimelineItem {
  return Object.freeze({ ...i, metadata: freezeMetadata(i.metadata) });
}

export function freezeTimeline(t: GoalTimeline): GoalTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeHistoryEntry(e: GoalHistoryEntry): GoalHistoryEntry {
  return Object.freeze({
    ...e,
    signalKeys: Object.freeze([...e.signalKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeHistory(h: GoalHistory): GoalHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeWindow(w: GoalTrend): GoalTrend {
  return Object.freeze({
    ...w,
    itemIds: Object.freeze([...w.itemIds]),
    metadata: freezeMetadata(w.metadata),
  });
}

export function freezeStatistics(s: GoalStatistics): GoalStatistics {
  return Object.freeze({
    ...s,
    byCategory: Object.freeze({ ...s.byCategory }),
    bySeverity: Object.freeze({ ...s.bySeverity }),
  });
}

export function freezeDiagnostics(d: GoalDiagnostics): GoalDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeContinuousAdaptationHandoff(
  i: ContinuousAdaptationInput,
): ContinuousAdaptationInput {
  return Object.freeze({
    ...i,
    decisionIds: Object.freeze([...i.decisionIds]),
    signalKeys: Object.freeze([...i.signalKeys]),
    categoryKeys: Object.freeze([...i.categoryKeys]),
    metadata: freezeMetadata(i.metadata),
  });
}

/** @deprecated Use freezeContinuousAdaptationHandoff */
export const freezeWorkoutHandoff = freezeContinuousAdaptationHandoff;
/** @deprecated Use freezeContinuousAdaptationHandoff */
export const freezeNutritionHandoff = freezeContinuousAdaptationHandoff;
/** @deprecated Use freezeContinuousAdaptationHandoff */
export const freezeRecoveryHandoff = freezeContinuousAdaptationHandoff;
/** @deprecated Use freezeContinuousAdaptationHandoff */
export const freezeGoalHandoff = freezeContinuousAdaptationHandoff;

export function freezeContext(c: GoalProgressContext): GoalProgressContext {
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

export function freezePackage(p: GoalPackage): GoalPackage {
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
    continuousAdaptationInput: p.continuousAdaptationInput
      ? freezeContinuousAdaptationHandoff(p.continuousAdaptationInput)
      : null,
    dependencies: Object.freeze(p.dependencies.map(freezeDependency)),
    constraints: Object.freeze(p.constraints.map(freezeConstraint)),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeInput(i: GoalProgressInput): GoalProgressInput {
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

export function freezeOutput(o: GoalProgressOutput): GoalProgressOutput {
  return Object.freeze({
    decisions: Object.freeze(o.decisions.map(freezeDecision)),
    package: o.package ? freezePackage(o.package) : null,
    continuousAdaptationInput: o.continuousAdaptationInput
      ? freezeContinuousAdaptationHandoff(o.continuousAdaptationInput)
      : null,
  });
}

export function freezeResult(r: GoalResult): GoalResult {
  return Object.freeze({
    ...r,
    decisions: Object.freeze(r.decisions.map(freezeDecision)),
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    continuousAdaptationInput: r.continuousAdaptationInput
      ? freezeContinuousAdaptationHandoff(r.continuousAdaptationInput)
      : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}

export function freezeState(s: GoalProgressState): GoalProgressState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    decisions: Object.freeze(s.decisions.map(freezeDecision)),
  });
}

export function freezeDescriptor(d: GoalDescriptor): GoalDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: GoalValidation): GoalValidation {
  return Object.freeze({ ...v, issues: Object.freeze([...v.issues]) });
}
