import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationAction } from "../models/RecommendationAction";
import type { RecommendationConfidence } from "../models/RecommendationConfidence";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import type { RecommendationConstraint } from "../models/RecommendationConstraint";
import type { RecommendationContext } from "../models/RecommendationContext";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationDiagnostics } from "../models/RecommendationDiagnostics";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationMetadata } from "../models/RecommendationMetadata";
import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationPlan } from "../models/RecommendationPlan";
import type { RecommendationPriority } from "../models/RecommendationPriority";
import type { RecommendationReference } from "../models/RecommendationReference";
import type { RecommendationResolution } from "../models/RecommendationResolution";
import type { RecommendationResult } from "../models/RecommendationResult";
import type { RecommendationSequence } from "../models/RecommendationSequence";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationState } from "../models/RecommendationState";
import type { RecommendationStatistics } from "../models/RecommendationStatistics";
import type { RecommendationStep } from "../models/RecommendationStep";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import type { RecommendationTarget } from "../models/RecommendationTarget";
import type {
  RecommendationTimeline,
  RecommendationTimelineItem,
} from "../models/RecommendationTimeline";
import type { RecommendationValidation } from "../models/RecommendationValidation";
import type { RecommendationView } from "../models/RecommendationView";

export function freezeMetadata(
  metadata: RecommendationMetadata,
): RecommendationMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezePriority(
  priority: RecommendationPriority,
): RecommendationPriority {
  return Object.freeze({ ...priority });
}

export function freezeConfidence(
  confidence: RecommendationConfidence,
): RecommendationConfidence {
  return Object.freeze({
    ...confidence,
    notes: Object.freeze([...confidence.notes]),
  });
}

export function freezeAction(action: RecommendationAction): RecommendationAction {
  return Object.freeze({
    ...action,
    parameters: Object.freeze({ ...action.parameters }),
    metadata: freezeMetadata(action.metadata),
  });
}

export function freezeStep(step: RecommendationStep): RecommendationStep {
  return Object.freeze({
    ...step,
    action: freezeAction(step.action),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezeSequence(
  sequence: RecommendationSequence,
): RecommendationSequence {
  return Object.freeze({
    ...sequence,
    steps: Object.freeze(sequence.steps.map(freezeStep)),
    metadata: freezeMetadata(sequence.metadata),
  });
}

export function freezeConstraint(
  constraint: RecommendationConstraint,
): RecommendationConstraint {
  return Object.freeze({
    ...constraint,
    subjectKeys: Object.freeze([...constraint.subjectKeys]),
    metadata: freezeMetadata(constraint.metadata),
  });
}

export function freezeDependency(
  dependency: RecommendationDependency,
): RecommendationDependency {
  return Object.freeze({
    ...dependency,
    metadata: freezeMetadata(dependency.metadata),
  });
}

export function freezeConflict(
  conflict: RecommendationConflict,
): RecommendationConflict {
  return Object.freeze({
    ...conflict,
    metadata: freezeMetadata(conflict.metadata),
  });
}

export function freezeResolution(
  resolution: RecommendationResolution,
): RecommendationResolution {
  return Object.freeze({
    ...resolution,
    loserIds: Object.freeze([...resolution.loserIds]),
    notes: Object.freeze([...resolution.notes]),
    metadata: freezeMetadata(resolution.metadata),
  });
}

export function freezeReference(
  ref: RecommendationReference,
): RecommendationReference {
  return Object.freeze({
    ...ref,
    metadata: freezeMetadata(ref.metadata),
  });
}

export function freezeTarget(target: RecommendationTarget): RecommendationTarget {
  return Object.freeze({
    ...target,
    metadata: freezeMetadata(target.metadata),
  });
}

export function freezeGroup(group: RecommendationGroup): RecommendationGroup {
  return Object.freeze({
    ...group,
    recommendationIds: Object.freeze([...group.recommendationIds]),
    metadata: freezeMetadata(group.metadata),
  });
}

export function freezeRecommendation(
  recommendation: CoachingRecommendation,
): CoachingRecommendation {
  return Object.freeze({
    ...recommendation,
    priority: freezePriority(recommendation.priority),
    confidence: freezeConfidence(recommendation.confidence),
    actions: Object.freeze(recommendation.actions.map(freezeAction)),
    sequence: recommendation.sequence
      ? freezeSequence(recommendation.sequence)
      : null,
    constraints: Object.freeze(recommendation.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(
      recommendation.dependencies.map(freezeDependency),
    ),
    targets: Object.freeze(recommendation.targets.map(freezeTarget)),
    sourceKeys: Object.freeze([...recommendation.sourceKeys]),
    metadata: freezeMetadata(recommendation.metadata),
  });
}

export function freezePlan(plan: RecommendationPlan): RecommendationPlan {
  return Object.freeze({
    ...plan,
    orderedIds: Object.freeze([...plan.orderedIds]),
    steps: Object.freeze(plan.steps.map(freezeStep)),
    sequences: Object.freeze(plan.sequences.map(freezeSequence)),
    groups: Object.freeze(plan.groups.map(freezeGroup)),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeSummary(
  summary: RecommendationSummary,
): RecommendationSummary {
  return Object.freeze({
    ...summary,
    focusAreas: Object.freeze([...summary.focusAreas]),
    metadata: freezeMetadata(summary.metadata),
  });
}

export function freezeSnapshot(
  snapshot: RecommendationSnapshot,
): RecommendationSnapshot {
  return Object.freeze({
    ...snapshot,
    recommendations: Object.freeze(
      snapshot.recommendations.map(freezeRecommendation),
    ),
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeStatistics(
  statistics: RecommendationStatistics,
): RecommendationStatistics {
  return Object.freeze({
    ...statistics,
    byCategory: Object.freeze({ ...statistics.byCategory }),
    byIntent: Object.freeze({ ...statistics.byIntent }),
    byType: Object.freeze({ ...statistics.byType }),
  });
}

export function freezeDiagnostics(
  diagnostics: RecommendationDiagnostics,
): RecommendationDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...diagnostics.notes]),
    warnings: Object.freeze([...diagnostics.warnings]),
    blockedIds: Object.freeze([...diagnostics.blockedIds]),
    deferredIds: Object.freeze([...diagnostics.deferredIds]),
    processingSteps: Object.freeze([...diagnostics.processingSteps]),
  });
}

export function freezeTimelineItem(
  item: RecommendationTimelineItem,
): RecommendationTimelineItem {
  return Object.freeze({
    ...item,
    metadata: freezeMetadata(item.metadata),
  });
}

export function freezeTimeline(
  timeline: RecommendationTimeline,
): RecommendationTimeline {
  return Object.freeze({
    ...timeline,
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
  });
}

export function freezeView(view: RecommendationView): RecommendationView {
  return Object.freeze({
    ...view,
    primary: view.primary ? freezeRecommendation(view.primary) : null,
    ordered: Object.freeze(view.ordered.map(freezeRecommendation)),
    groups: Object.freeze(view.groups.map(freezeGroup)),
    metadata: freezeMetadata(view.metadata),
  });
}

export function freezeExplainabilityInput(
  input: ExplainabilityInput,
): ExplainabilityInput {
  return Object.freeze({
    ...input,
    recommendationIds: Object.freeze([...input.recommendationIds]),
    decisionIds: Object.freeze([...input.decisionIds]),
    summary: input.summary ? freezeSummary(input.summary) : null,
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezeContext(
  context: RecommendationContext,
): RecommendationContext {
  return Object.freeze({
    ...context,
    decisionIds: Object.freeze([...context.decisionIds]),
    references: Object.freeze(context.references.map(freezeReference)),
    focusAreas: Object.freeze([...context.focusAreas]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezePackage(
  pkg: RecommendationPackage,
): RecommendationPackage {
  return Object.freeze({
    ...pkg,
    recommendationContext: freezeContext(pkg.recommendationContext),
    recommendations: Object.freeze(
      pkg.recommendations.map(freezeRecommendation),
    ),
    conflicts: Object.freeze(pkg.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(pkg.resolutions.map(freezeResolution)),
    constraints: Object.freeze(pkg.constraints.map(freezeConstraint)),
    dependencies: Object.freeze(pkg.dependencies.map(freezeDependency)),
    groups: Object.freeze(pkg.groups.map(freezeGroup)),
    plan: pkg.plan ? freezePlan(pkg.plan) : null,
    view: pkg.view ? freezeView(pkg.view) : null,
    summary: pkg.summary ? freezeSummary(pkg.summary) : null,
    snapshot: pkg.snapshot ? freezeSnapshot(pkg.snapshot) : null,
    statistics: freezeStatistics(pkg.statistics),
    diagnostics: freezeDiagnostics(pkg.diagnostics),
    timeline: freezeTimeline(pkg.timeline),
    explainabilityInput: pkg.explainabilityInput
      ? freezeExplainabilityInput(pkg.explainabilityInput)
      : null,
    metadata: freezeMetadata(pkg.metadata),
  });
}

export function freezeInput(input: RecommendationInput): RecommendationInput {
  return Object.freeze({
    ...input,
    recommendationContext: input.recommendationContext
      ? freezeContext(input.recommendationContext)
      : null,
    decisions: Object.freeze([...input.decisions]),
    recommendations: Object.freeze(
      input.recommendations.map(freezeRecommendation),
    ),
    metadata: freezeMetadata(input.metadata),
  });
}

export function freezeResult(result: RecommendationResult): RecommendationResult {
  return Object.freeze({
    ...result,
    recommendations: Object.freeze(
      result.recommendations.map(freezeRecommendation),
    ),
    package: result.package ? freezePackage(result.package) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    explainabilityInput: result.explainabilityInput
      ? freezeExplainabilityInput(result.explainabilityInput)
      : null,
    validation: result.validation
      ? Object.freeze({
          ...result.validation,
          errors: Object.freeze([...result.validation.errors]),
          warnings: Object.freeze([...result.validation.warnings]),
        })
      : null,
    descriptor: result.descriptor
      ? Object.freeze({
          ...result.descriptor,
          capabilities: Object.freeze([...result.descriptor.capabilities]),
          boundaries: Object.freeze([...result.descriptor.boundaries]),
        })
      : null,
    errors: Object.freeze([...result.errors]),
  });
}

export function freezeState(state: RecommendationState): RecommendationState {
  return Object.freeze({
    ...state,
    package: state.package ? freezePackage(state.package) : null,
    recommendations: Object.freeze(
      state.recommendations.map(freezeRecommendation),
    ),
  });
}

export function freezeDescriptor(
  descriptor: RecommendationDescriptor,
): RecommendationDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    boundaries: Object.freeze([...descriptor.boundaries]),
  });
}

export function freezeValidation(
  validation: RecommendationValidation,
): RecommendationValidation {
  return Object.freeze({
    ...validation,
    errors: Object.freeze([...validation.errors]),
    warnings: Object.freeze([...validation.warnings]),
  });
}
