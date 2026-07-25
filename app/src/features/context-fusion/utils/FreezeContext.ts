import type { ContextConfidence } from "../models/ContextConfidence";
import type { ContextConflict } from "../models/ContextConflict";
import type { ContextContribution } from "../models/ContextContribution";
import type { ContextDependency } from "../models/ContextDependency";
import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextDiagnostics } from "../models/ContextDiagnostics";
import type { ContextIntegrity } from "../models/ContextIntegrity";
import type { ContextMerge } from "../models/ContextMerge";
import type { ContextMetadata } from "../models/ContextMetadata";
import type { ContextPackage } from "../models/ContextPackage";
import type { ContextPriority } from "../models/ContextPriority";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResolution } from "../models/ContextResolution";
import type { ContextResult } from "../models/ContextResult";
import type { ContextSection } from "../models/ContextSection";
import type { ContextSlice } from "../models/ContextSlice";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { ContextSource } from "../models/ContextSource";
import type { ContextStatistics } from "../models/ContextStatistics";
import type { ContextSummary } from "../models/ContextSummary";
import type {
  ContextTimeline,
  ContextTimelineItem,
} from "../models/ContextTimeline";
import type { ContextValidation } from "../models/ContextValidation";
import type { ContextVersion } from "../models/ContextVersion";
import type { ContextView } from "../models/ContextView";
import type { DecisionEngineContext } from "../models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function freezeMetadata(metadata: ContextMetadata): ContextMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeVersion(version: ContextVersion): ContextVersion {
  return Object.freeze({ ...version });
}

export function freezeSource(source: ContextSource): ContextSource {
  return Object.freeze({
    ...source,
    version: source.version ? freezeVersion(source.version) : null,
    notes: Object.freeze([...source.notes]),
    metadata: freezeMetadata(source.metadata),
  });
}

export function freezePriority(priority: ContextPriority): ContextPriority {
  return Object.freeze({ ...priority });
}

export function freezeConfidence(
  confidence: ContextConfidence,
): ContextConfidence {
  return Object.freeze({
    ...confidence,
    notes: Object.freeze([...confidence.notes]),
  });
}

export function freezeDependency(
  dependency: ContextDependency,
): ContextDependency {
  return Object.freeze({
    ...dependency,
    notes: Object.freeze([...dependency.notes]),
  });
}

export function freezeSection(section: ContextSection): ContextSection {
  return Object.freeze({
    ...section,
    facts: Object.freeze({ ...section.facts }),
    notes: Object.freeze([...section.notes]),
    metadata: freezeMetadata(section.metadata),
  });
}

export function freezeView(view: ContextView): ContextView {
  return Object.freeze({
    ...view,
    sectionIds: Object.freeze([...view.sectionIds]),
    sections: Object.freeze(view.sections.map(freezeSection)),
    notes: Object.freeze([...view.notes]),
  });
}

export function freezeConflict(conflict: ContextConflict): ContextConflict {
  return Object.freeze({
    ...conflict,
    sources: Object.freeze([...conflict.sources]),
    values: Object.freeze([...conflict.values]),
    notes: Object.freeze([...conflict.notes]),
  });
}

export function freezeResolution(
  resolution: ContextResolution,
): ContextResolution {
  return Object.freeze({ ...resolution });
}

export function freezeMerge(merge: ContextMerge): ContextMerge {
  return Object.freeze({
    ...merge,
    sourceKinds: Object.freeze([...merge.sourceKinds]),
    resolutions: Object.freeze(merge.resolutions.map(freezeResolution)),
    notes: Object.freeze([...merge.notes]),
    metadata: freezeMetadata(merge.metadata),
  });
}

export function freezeIntegrity(
  integrity: ContextIntegrity,
): ContextIntegrity {
  return Object.freeze({
    valid: integrity.valid,
    issues: Object.freeze(
      integrity.issues.map((i) => Object.freeze({ ...i })),
    ),
  });
}

export function freezeTimelineItem(
  item: ContextTimelineItem,
): ContextTimelineItem {
  return Object.freeze({
    ...item,
    notes: Object.freeze([...item.notes]),
  });
}

export function freezeTimeline(timeline: ContextTimeline): ContextTimeline {
  return Object.freeze({
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(timeline.metadata),
  });
}

export function freezeStatistics(
  statistics: ContextStatistics,
): ContextStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeDiagnostics(
  diagnostics: ContextDiagnostics,
): ContextDiagnostics {
  return Object.freeze({
    warnings: Object.freeze([...diagnostics.warnings]),
    notes: Object.freeze([...diagnostics.notes]),
    missingSources: Object.freeze([...diagnostics.missingSources]),
  });
}

export function freezeSummary(summary: ContextSummary): ContextSummary {
  return Object.freeze({
    ...summary,
    sourceLabels: Object.freeze([...summary.sourceLabels]),
    statistics: freezeStatistics(summary.statistics),
    confidence: freezeConfidence(summary.confidence),
    notes: Object.freeze([...summary.notes]),
  });
}

export function freezeSlice(slice: ContextSlice): ContextSlice {
  return Object.freeze({
    ...slice,
    facts: Object.freeze({ ...slice.facts }),
    notes: Object.freeze([...slice.notes]),
    metadata: freezeMetadata(slice.metadata),
  });
}

export function freezeContribution(
  contribution: ContextContribution,
): ContextContribution {
  return Object.freeze({
    ...contribution,
    slice: freezeSlice(contribution.slice),
    version: contribution.version ? freezeVersion(contribution.version) : null,
    notes: Object.freeze([...contribution.notes]),
    metadata: freezeMetadata(contribution.metadata),
  });
}

export function freezeRequest(request: ContextRequest): ContextRequest {
  return Object.freeze({
    ...request,
    base: request.base ? freezeContext(request.base) : null,
    contributions: Object.freeze(
      request.contributions.map(freezeContribution),
    ),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeContext(
  context: UnifiedCoachingContext,
): UnifiedCoachingContext {
  return Object.freeze({
    ...context,
    version: freezeVersion(context.version),
    sources: Object.freeze(context.sources.map(freezeSource)),
    sections: Object.freeze(context.sections.map(freezeSection)),
    views: Object.freeze(context.views.map(freezeView)),
    dependencies: Object.freeze(context.dependencies.map(freezeDependency)),
    priorities: Object.freeze(context.priorities.map(freezePriority)),
    conflicts: Object.freeze(context.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(context.resolutions.map(freezeResolution)),
    merge: context.merge ? freezeMerge(context.merge) : null,
    integrity: freezeIntegrity(context.integrity),
    confidence: freezeConfidence(context.confidence),
    timeline: freezeTimeline(context.timeline),
    statistics: freezeStatistics(context.statistics),
    diagnostics: freezeDiagnostics(context.diagnostics),
    summary: context.summary ? freezeSummary(context.summary) : null,
    conversation: context.conversation
      ? freezeSlice(context.conversation)
      : null,
    session: context.session ? freezeSlice(context.session) : null,
    athlete: context.athlete ? freezeSlice(context.athlete) : null,
    workout: context.workout ? freezeSlice(context.workout) : null,
    nutrition: context.nutrition ? freezeSlice(context.nutrition) : null,
    recovery: context.recovery ? freezeSlice(context.recovery) : null,
    goal: context.goal ? freezeSlice(context.goal) : null,
    supervisor: context.supervisor ? freezeSlice(context.supervisor) : null,
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeSnapshot(snapshot: ContextSnapshot): ContextSnapshot {
  return Object.freeze({
    ...snapshot,
    version: freezeVersion(snapshot.version),
    context: freezeContext(snapshot.context),
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeDecisionEngineContext(
  ctx: DecisionEngineContext,
): DecisionEngineContext {
  return Object.freeze({
    ...ctx,
    version: freezeVersion(ctx.version),
    context: freezeContext(ctx.context),
    summary: ctx.summary ? freezeSummary(ctx.summary) : null,
    focusAreas: Object.freeze([...ctx.focusAreas]),
    metadata: freezeMetadata(ctx.metadata),
  });
}

export function freezePackage(pkg: ContextPackage): ContextPackage {
  return Object.freeze({
    ...pkg,
    context: freezeContext(pkg.context),
    snapshot: pkg.snapshot ? freezeSnapshot(pkg.snapshot) : null,
    summary: pkg.summary ? freezeSummary(pkg.summary) : null,
    decisionEngineContext: pkg.decisionEngineContext
      ? freezeDecisionEngineContext(pkg.decisionEngineContext)
      : null,
    metadata: freezeMetadata(pkg.metadata),
  });
}

export function freezeDescriptor(
  descriptor: ContextDescriptor,
): ContextDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    sourceKinds: Object.freeze([...descriptor.sourceKinds]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeValidation(
  validation: ContextValidation,
): ContextValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(
      validation.issues.map((i) => Object.freeze({ ...i })),
    ),
  });
}

export function freezeResult(result: ContextResult): ContextResult {
  return Object.freeze({
    ...result,
    context: result.context ? freezeContext(result.context) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    package: result.package ? freezePackage(result.package) : null,
    decisionEngineContext: result.decisionEngineContext
      ? freezeDecisionEngineContext(result.decisionEngineContext)
      : null,
    descriptor: result.descriptor ? freezeDescriptor(result.descriptor) : null,
    validation: result.validation ? freezeValidation(result.validation) : null,
    error: result.error ? Object.freeze({ ...result.error }) : null,
  });
}
