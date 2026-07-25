import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationConfidence } from "../models/ExplanationConfidence";
import type { ExplanationConflict } from "../models/ExplanationConflict";
import type { ExplanationConstraint } from "../models/ExplanationConstraint";
import type { ExplanationContextReference } from "../models/ExplanationContextReference";
import type { ExplanationDecisionLink } from "../models/ExplanationDecisionLink";
import type { ExplanationDependency } from "../models/ExplanationDependency";
import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationDiagnostics } from "../models/ExplanationDiagnostics";
import type { ExplanationEdge } from "../models/ExplanationEdge";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import type { ExplanationGraph } from "../models/ExplanationGraph";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationMetadata } from "../models/ExplanationMetadata";
import type { ExplanationNode } from "../models/ExplanationNode";
import type { ExplanationPackage } from "../models/ExplanationPackage";
import type { ExplanationPriority } from "../models/ExplanationPriority";
import type { ExplanationReason } from "../models/ExplanationReason";
import type { ExplanationRecommendationLink } from "../models/ExplanationRecommendationLink";
import type { ExplanationReference } from "../models/ExplanationReference";
import type { ExplanationResolution } from "../models/ExplanationResolution";
import type { ExplanationResult } from "../models/ExplanationResult";
import type { ExplanationSection } from "../models/ExplanationSection";
import type { ExplanationSnapshot } from "../models/ExplanationSnapshot";
import type { ExplanationState } from "../models/ExplanationState";
import type { ExplanationStatistics } from "../models/ExplanationStatistics";
import type { ExplanationStep } from "../models/ExplanationStep";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import type { ExplanationTimeline, ExplanationTimelineItem } from "../models/ExplanationTimeline";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import type { ExplanationValidation } from "../models/ExplanationValidation";
import type { LLMFormatterInput } from "../models/LLMFormatterInput";

export function freezeMetadata(m: ExplanationMetadata): ExplanationMetadata {
  return Object.freeze({ tags: Object.freeze([...m.tags]), attributes: Object.freeze({ ...m.attributes }) });
}

export function freezeConfidence(c: ExplanationConfidence): ExplanationConfidence {
  return Object.freeze({ ...c, notes: Object.freeze([...c.notes]) });
}

export function freezePriority(p: ExplanationPriority): ExplanationPriority {
  return Object.freeze({ ...p });
}

export function freezeReason(r: ExplanationReason): ExplanationReason {
  return Object.freeze({ ...r, evidenceKeys: Object.freeze([...r.evidenceKeys]), metadata: freezeMetadata(r.metadata) });
}

export function freezeEvidence(e: ExplanationEvidence): ExplanationEvidence {
  return Object.freeze({ ...e, valueKeys: Object.freeze([...e.valueKeys]), metadata: freezeMetadata(e.metadata) });
}

export function freezeSection(s: ExplanationSection): ExplanationSection {
  return Object.freeze({ ...s, itemKeys: Object.freeze([...s.itemKeys]), metadata: freezeMetadata(s.metadata) });
}

export function freezeDecisionLink(l: ExplanationDecisionLink): ExplanationDecisionLink {
  return Object.freeze({ ...l, metadata: freezeMetadata(l.metadata) });
}

export function freezeRecommendationLink(l: ExplanationRecommendationLink): ExplanationRecommendationLink {
  return Object.freeze({ ...l, metadata: freezeMetadata(l.metadata) });
}

export function freezeContextReference(r: ExplanationContextReference): ExplanationContextReference {
  return Object.freeze({ ...r, focusAreaKeys: Object.freeze([...r.focusAreaKeys]), metadata: freezeMetadata(r.metadata) });
}

export function freezeExplanation(e: CoachingExplanation): CoachingExplanation {
  return Object.freeze({
    ...e,
    reasons: Object.freeze(e.reasons.map(freezeReason)),
    evidence: Object.freeze(e.evidence.map(freezeEvidence)),
    sections: Object.freeze(e.sections.map(freezeSection)),
    confidence: freezeConfidence(e.confidence),
    priority: freezePriority(e.priority),
    decisionLink: freezeDecisionLink(e.decisionLink),
    recommendationLink: freezeRecommendationLink(e.recommendationLink),
    contextReference: freezeContextReference(e.contextReference),
    sourceKeys: Object.freeze([...e.sourceKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeStep(s: ExplanationStep): ExplanationStep {
  return Object.freeze({ ...s, inputKeys: Object.freeze([...s.inputKeys]), outputKeys: Object.freeze([...s.outputKeys]), metadata: freezeMetadata(s.metadata) });
}

export function freezeTrace(t: ExplanationTrace): ExplanationTrace {
  return Object.freeze({ ...t, steps: Object.freeze(t.steps.map(freezeStep)), metadata: freezeMetadata(t.metadata) });
}

export function freezeNode(n: ExplanationNode): ExplanationNode {
  return Object.freeze({ ...n, metadata: freezeMetadata(n.metadata) });
}

export function freezeEdge(e: ExplanationEdge): ExplanationEdge {
  return Object.freeze({ ...e, metadata: freezeMetadata(e.metadata) });
}

export function freezeGraph(g: ExplanationGraph): ExplanationGraph {
  return Object.freeze({ ...g, nodes: Object.freeze(g.nodes.map(freezeNode)), edges: Object.freeze(g.edges.map(freezeEdge)), metadata: freezeMetadata(g.metadata) });
}

export function freezeSummary(s: ExplanationSummary): ExplanationSummary {
  return Object.freeze({ ...s, reasonCodeKeys: Object.freeze([...s.reasonCodeKeys]), focusAreaKeys: Object.freeze([...s.focusAreaKeys]), metadata: freezeMetadata(s.metadata) });
}

export function freezeSnapshot(s: ExplanationSnapshot): ExplanationSnapshot {
  return Object.freeze({ ...s, explanations: Object.freeze(s.explanations.map(freezeExplanation)), summary: s.summary ? freezeSummary(s.summary) : null, metadata: freezeMetadata(s.metadata) });
}

export function freezeStatistics(s: ExplanationStatistics): ExplanationStatistics {
  return Object.freeze({ ...s, byCategory: Object.freeze({ ...s.byCategory }), byReasonCode: Object.freeze({ ...s.byReasonCode }) });
}

export function freezeDiagnostics(d: ExplanationDiagnostics): ExplanationDiagnostics {
  return Object.freeze({ notes: Object.freeze([...d.notes]), warnings: Object.freeze([...d.warnings]), processingSteps: Object.freeze([...d.processingSteps]) });
}

export function freezeTimelineItem(i: ExplanationTimelineItem): ExplanationTimelineItem {
  return Object.freeze({ ...i, metadata: freezeMetadata(i.metadata) });
}

export function freezeTimeline(t: ExplanationTimeline): ExplanationTimeline {
  return Object.freeze({ ...t, items: Object.freeze(t.items.map(freezeTimelineItem)) });
}

export function freezeLLMFormatterInput(i: LLMFormatterInput): LLMFormatterInput {
  return Object.freeze({ ...i, explanationIds: Object.freeze([...i.explanationIds]), sectionKeys: Object.freeze([...i.sectionKeys]), reasonCodes: Object.freeze([...i.reasonCodes]), evidenceKeys: Object.freeze([...i.evidenceKeys]), summary: i.summary ? freezeSummary(i.summary) : null, metadata: freezeMetadata(i.metadata) });
}

export function freezeDependency(d: ExplanationDependency): ExplanationDependency {
  return Object.freeze({ ...d, metadata: freezeMetadata(d.metadata) });
}

export function freezeConstraint(c: ExplanationConstraint): ExplanationConstraint {
  return Object.freeze({ ...c, subjectKeys: Object.freeze([...c.subjectKeys]), metadata: freezeMetadata(c.metadata) });
}

export function freezeConflict(c: ExplanationConflict): ExplanationConflict {
  return Object.freeze({ ...c, subjectIds: Object.freeze([...c.subjectIds]), metadata: freezeMetadata(c.metadata) });
}

export function freezeResolution(r: ExplanationResolution): ExplanationResolution {
  return Object.freeze({ ...r, loserIds: Object.freeze([...r.loserIds]), notes: Object.freeze([...r.notes]), metadata: freezeMetadata(r.metadata) });
}

export function freezeReference(r: ExplanationReference): ExplanationReference {
  return Object.freeze({ ...r, metadata: freezeMetadata(r.metadata) });
}

export function freezePackage(p: ExplanationPackage): ExplanationPackage {
  return Object.freeze({
    ...p,
    explanations: Object.freeze(p.explanations.map(freezeExplanation)),
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    graph: p.graph ? freezeGraph(p.graph) : null,
    trace: p.trace ? freezeTrace(p.trace) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    llmFormatterInput: p.llmFormatterInput ? freezeLLMFormatterInput(p.llmFormatterInput) : null,
    dependencies: Object.freeze(p.dependencies.map(freezeDependency)),
    constraints: Object.freeze(p.constraints.map(freezeConstraint)),
    conflicts: Object.freeze(p.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(p.resolutions.map(freezeResolution)),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeInput(i: ExplanationInput): ExplanationInput {
  return Object.freeze({ ...i, decisions: Object.freeze([...i.decisions]), recommendations: Object.freeze([...i.recommendations]), metadata: freezeMetadata(i.metadata) });
}

export function freezeResult(r: ExplanationResult): ExplanationResult {
  return Object.freeze({
    ...r,
    explanations: Object.freeze(r.explanations.map(freezeExplanation)),
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    llmFormatterInput: r.llmFormatterInput ? freezeLLMFormatterInput(r.llmFormatterInput) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}

export function freezeState(s: ExplanationState): ExplanationState {
  return Object.freeze({ ...s, package: s.package ? freezePackage(s.package) : null, explanations: Object.freeze(s.explanations.map(freezeExplanation)) });
}

export function freezeDescriptor(d: ExplanationDescriptor): ExplanationDescriptor {
  return Object.freeze({ ...d, capabilities: Object.freeze([...d.capabilities]), boundaries: Object.freeze([...d.boundaries]) });
}

export function freezeValidation(v: ExplanationValidation): ExplanationValidation {
  return Object.freeze({ ...v, issues: Object.freeze([...v.issues]) });
}
