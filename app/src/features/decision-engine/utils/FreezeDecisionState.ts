import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConfidence } from "../models/DecisionConfidence";
import type { DecisionConflict } from "../models/DecisionConflict";
import type { DecisionConstraint } from "../models/DecisionConstraint";
import type { DecisionContext } from "../models/DecisionContext";
import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionDiagnostics } from "../models/DecisionDiagnostics";
import type { DecisionEvaluation } from "../models/DecisionEvaluation";
import type { DecisionGraph, DecisionGraphEdge, DecisionGraphNode } from "../models/DecisionGraph";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionMetadata } from "../models/DecisionMetadata";
import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionPlan } from "../models/DecisionPlan";
import type { DecisionPriority } from "../models/DecisionPriority";
import type { DecisionReason } from "../models/DecisionReason";
import type { DecisionRecommendationReference } from "../models/DecisionRecommendationReference";
import type { DecisionResolution } from "../models/DecisionResolution";
import type { DecisionResult } from "../models/DecisionResult";
import type { DecisionScore } from "../models/DecisionScore";
import type { DecisionSnapshot } from "../models/DecisionSnapshot";
import type { DecisionState } from "../models/DecisionState";
import type { DecisionStatistics } from "../models/DecisionStatistics";
import type { DecisionStep } from "../models/DecisionStep";
import type { DecisionSummary } from "../models/DecisionSummary";
import type {
  DecisionTimeline,
  DecisionTimelineItem,
} from "../models/DecisionTimeline";
import type { DecisionValidation } from "../models/DecisionValidation";
import type { RecommendationEngineInput } from "../models/RecommendationEngineInput";

export function freezeMetadata(metadata: DecisionMetadata): DecisionMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezePriority(priority: DecisionPriority): DecisionPriority {
  return Object.freeze({ ...priority });
}

export function freezeConfidence(
  confidence: DecisionConfidence,
): DecisionConfidence {
  return Object.freeze({
    ...confidence,
    notes: Object.freeze([...confidence.notes]),
  });
}

export function freezeScore(score: DecisionScore): DecisionScore {
  return Object.freeze({ ...score });
}

export function freezeReason(reason: DecisionReason): DecisionReason {
  return Object.freeze({
    ...reason,
    evidenceKeys: Object.freeze([...reason.evidenceKeys]),
    metadata: freezeMetadata(reason.metadata),
  });
}

export function freezeConstraint(
  constraint: DecisionConstraint,
): DecisionConstraint {
  return Object.freeze({
    ...constraint,
    subjectKeys: Object.freeze([...constraint.subjectKeys]),
    metadata: freezeMetadata(constraint.metadata),
  });
}

export function freezeDependency(
  dependency: DecisionDependency,
): DecisionDependency {
  return Object.freeze({
    ...dependency,
    metadata: freezeMetadata(dependency.metadata),
  });
}

export function freezeConflict(conflict: DecisionConflict): DecisionConflict {
  return Object.freeze({
    ...conflict,
    metadata: freezeMetadata(conflict.metadata),
  });
}

export function freezeResolution(
  resolution: DecisionResolution,
): DecisionResolution {
  return Object.freeze({
    ...resolution,
    loserIds: Object.freeze([...resolution.loserIds]),
    notes: Object.freeze([...resolution.notes]),
    metadata: freezeMetadata(resolution.metadata),
  });
}

export function freezeRecommendationRef(
  ref: DecisionRecommendationReference,
): DecisionRecommendationReference {
  return Object.freeze({
    ...ref,
    metadata: freezeMetadata(ref.metadata),
  });
}

export function freezeCandidate(
  candidate: DecisionCandidate,
): DecisionCandidate {
  return Object.freeze({
    ...candidate,
    priority: freezePriority(candidate.priority),
    confidence: freezeConfidence(candidate.confidence),
    reasons: Object.freeze(candidate.reasons.map(freezeReason)),
    sourceKeys: Object.freeze([...candidate.sourceKeys]),
    metadata: freezeMetadata(candidate.metadata),
  });
}

export function freezeDecision(decision: CoachingDecision): CoachingDecision {
  return Object.freeze({
    ...decision,
    priority: freezePriority(decision.priority),
    confidence: freezeConfidence(decision.confidence),
    score: freezeScore(decision.score),
    reasons: Object.freeze(decision.reasons.map(freezeReason)),
    constraints: Object.freeze(decision.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(decision.dependencies.map(freezeDependency)),
    recommendationRefs: Object.freeze(
      decision.recommendationRefs.map(freezeRecommendationRef),
    ),
    sourceKeys: Object.freeze([...decision.sourceKeys]),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeEvaluation(
  evaluation: DecisionEvaluation,
): DecisionEvaluation {
  return Object.freeze({
    ...evaluation,
    score: freezeScore(evaluation.score),
    confidence: freezeConfidence(evaluation.confidence),
    violations: Object.freeze([...evaluation.violations]),
    notes: Object.freeze([...evaluation.notes]),
    metadata: freezeMetadata(evaluation.metadata),
  });
}

export function freezeStep(step: DecisionStep): DecisionStep {
  return Object.freeze({
    ...step,
    dependsOn: Object.freeze([...step.dependsOn]),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezePlan(plan: DecisionPlan): DecisionPlan {
  return Object.freeze({
    ...plan,
    steps: Object.freeze(plan.steps.map(freezeStep)),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeGraphNode(node: DecisionGraphNode): DecisionGraphNode {
  return Object.freeze({ ...node });
}

export function freezeGraphEdge(edge: DecisionGraphEdge): DecisionGraphEdge {
  return Object.freeze({ ...edge });
}

export function freezeGraph(graph: DecisionGraph): DecisionGraph {
  return Object.freeze({
    ...graph,
    nodes: Object.freeze(graph.nodes.map(freezeGraphNode)),
    edges: Object.freeze(graph.edges.map(freezeGraphEdge)),
    roots: Object.freeze([...graph.roots]),
    leaves: Object.freeze([...graph.leaves]),
    metadata: freezeMetadata(graph.metadata),
  });
}

export function freezeSummary(summary: DecisionSummary): DecisionSummary {
  return Object.freeze({
    ...summary,
    focusAreas: Object.freeze([...summary.focusAreas]),
    metadata: freezeMetadata(summary.metadata),
  });
}

export function freezeSnapshot(snapshot: DecisionSnapshot): DecisionSnapshot {
  return Object.freeze({
    ...snapshot,
    decisions: Object.freeze(snapshot.decisions.map(freezeDecision)),
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeStatistics(
  statistics: DecisionStatistics,
): DecisionStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeDiagnostics(
  diagnostics: DecisionDiagnostics,
): DecisionDiagnostics {
  return Object.freeze({
    warnings: Object.freeze([...diagnostics.warnings]),
    notes: Object.freeze([...diagnostics.notes]),
    missingSources: Object.freeze([...diagnostics.missingSources]),
    blockedCandidates: Object.freeze([...diagnostics.blockedCandidates]),
  });
}

export function freezeTimelineItem(
  item: DecisionTimelineItem,
): DecisionTimelineItem {
  return Object.freeze({
    ...item,
    metadata: freezeMetadata(item.metadata),
  });
}

export function freezeTimeline(timeline: DecisionTimeline): DecisionTimeline {
  return Object.freeze({
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(timeline.metadata),
  });
}

export function freezeContext(context: DecisionContext): DecisionContext {
  return Object.freeze({
    ...context,
    focusAreas: Object.freeze([...context.focusAreas]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeInput(input: DecisionInput): DecisionInput {
  return Object.freeze({
    ...input,
    decisionContext: input.decisionContext
      ? freezeContext(input.decisionContext)
      : null,
    decisions: Object.freeze(input.decisions.map(freezeDecision)),
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezeRecommendationInput(
  input: RecommendationEngineInput,
): RecommendationEngineInput {
  return Object.freeze({
    ...input,
    decisionIds: Object.freeze([...input.decisionIds]),
    recommendations: Object.freeze(
      input.recommendations.map(freezeRecommendationRef),
    ),
    summary: input.summary ? freezeSummary(input.summary) : null,
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezePackage(pkg: DecisionPackage): DecisionPackage {
  return Object.freeze({
    ...pkg,
    decisionContext: freezeContext(pkg.decisionContext),
    candidates: Object.freeze(pkg.candidates.map(freezeCandidate)),
    decisions: Object.freeze(pkg.decisions.map(freezeDecision)),
    evaluations: Object.freeze(pkg.evaluations.map(freezeEvaluation)),
    conflicts: Object.freeze(pkg.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(pkg.resolutions.map(freezeResolution)),
    constraints: Object.freeze(pkg.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(pkg.dependencies.map(freezeDependency)),
    plan: pkg.plan ? freezePlan(pkg.plan) : null,
    graph: pkg.graph ? freezeGraph(pkg.graph) : null,
    summary: pkg.summary ? freezeSummary(pkg.summary) : null,
    snapshot: pkg.snapshot ? freezeSnapshot(pkg.snapshot) : null,
    statistics: freezeStatistics(pkg.statistics),
    diagnostics: freezeDiagnostics(pkg.diagnostics),
    timeline: freezeTimeline(pkg.timeline),
    recommendationInput: pkg.recommendationInput
      ? freezeRecommendationInput(pkg.recommendationInput)
      : null,
    metadata: freezeMetadata(pkg.metadata),
  });
}

export function freezeValidation(
  validation: DecisionValidation,
): DecisionValidation {
  return Object.freeze({
    valid: validation.valid,
    errors: Object.freeze([...validation.errors]),
    warnings: Object.freeze([...validation.warnings]),
  });
}

export function freezeDescriptor(
  descriptor: DecisionDescriptor,
): DecisionDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    categories: Object.freeze([...descriptor.categories]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeResult(result: DecisionResult): DecisionResult {
  return Object.freeze({
    ...result,
    decisions: Object.freeze(result.decisions.map(freezeDecision)),
    package: result.package ? freezePackage(result.package) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    recommendationInput: result.recommendationInput
      ? freezeRecommendationInput(result.recommendationInput)
      : null,
    validation: result.validation ? freezeValidation(result.validation) : null,
    descriptor: result.descriptor ? freezeDescriptor(result.descriptor) : null,
    errors: Object.freeze([...result.errors]),
  });
}

export function freezeState(state: DecisionState): DecisionState {
  return Object.freeze({
    ...state,
    package: state.package ? freezePackage(state.package) : null,
    decisions: Object.freeze(state.decisions.map(freezeDecision)),
  });
}
