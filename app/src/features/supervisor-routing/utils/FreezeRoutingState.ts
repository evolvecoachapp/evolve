import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingConstraint } from "../models/RoutingConstraint";
import type { RoutingContext } from "../models/RoutingContext";
import type { RoutingDecision } from "../models/RoutingDecision";
import type { RoutingDependency } from "../models/RoutingDependency";
import type { RoutingEdge } from "../models/RoutingEdge";
import type { RoutingError } from "../models/RoutingError";
import type { RoutingEvent } from "../models/RoutingEvent";
import type { RoutingExecutionOrder } from "../models/RoutingExecutionOrder";
import type { RoutingGraph } from "../models/RoutingGraph";
import type { RoutingMetadata } from "../models/RoutingMetadata";
import type { RoutingNode } from "../models/RoutingNode";
import type { RoutingPhase } from "../models/RoutingPhase";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingPolicy } from "../models/RoutingPolicy";
import type { RoutingPriority } from "../models/RoutingPriority";
import type { RoutingReasoning } from "../models/RoutingReasoning";
import type { RoutingRequest } from "../models/RoutingRequest";
import type { RoutingResult } from "../models/RoutingResult";
import type { RoutingSnapshot } from "../models/RoutingSnapshot";
import type { RoutingStatistics } from "../models/RoutingStatistics";
import type { RoutingStep } from "../models/RoutingStep";
import type { RoutingSummary } from "../models/RoutingSummary";
import type { RoutingTarget } from "../models/RoutingTarget";
import type {
  RoutingValidation,
  RoutingValidationIssue,
} from "../models/RoutingValidation";

export function freezeMetadata(metadata: RoutingMetadata): RoutingMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeValidationIssue(
  issue: RoutingValidationIssue,
): RoutingValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: RoutingValidation,
): RoutingValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeError(error: RoutingError | null): RoutingError | null {
  return error ? Object.freeze({ ...error }) : null;
}

export function freezeCapability(
  capability: RoutingCapability,
): RoutingCapability {
  return Object.freeze({
    ...capability,
    dependsOn: Object.freeze([...capability.dependsOn]),
    metadata: freezeMetadata(capability.metadata),
  });
}

export function freezeDependency(
  dependency: RoutingDependency,
): RoutingDependency {
  return Object.freeze({ ...dependency });
}

export function freezeConstraint(
  constraint: RoutingConstraint,
): RoutingConstraint {
  return Object.freeze({ ...constraint });
}

export function freezePriority(priority: RoutingPriority): RoutingPriority {
  return Object.freeze({ ...priority });
}

export function freezePhase(phase: RoutingPhase): RoutingPhase {
  return Object.freeze({
    ...phase,
    subjectIds: Object.freeze([...phase.subjectIds]),
  });
}

export function freezeTarget(target: RoutingTarget): RoutingTarget {
  return Object.freeze({
    ...target,
    metadata: freezeMetadata(target.metadata),
  });
}

export function freezeStep(step: RoutingStep): RoutingStep {
  return Object.freeze({
    ...step,
    dependsOnStepIds: Object.freeze([...step.dependsOnStepIds]),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezeDecision(decision: RoutingDecision): RoutingDecision {
  return Object.freeze({
    ...decision,
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeNode(node: RoutingNode): RoutingNode {
  return Object.freeze({ ...node });
}

export function freezeEdge(edge: RoutingEdge): RoutingEdge {
  return Object.freeze({ ...edge });
}

export function freezeExecutionOrder(
  order: RoutingExecutionOrder,
): RoutingExecutionOrder {
  return Object.freeze({
    ...order,
    stepIds: Object.freeze([...order.stepIds]),
    steps: Object.freeze(order.steps.map(freezeStep)),
  });
}

export function freezeGraph(graph: RoutingGraph): RoutingGraph {
  return Object.freeze({
    ...graph,
    nodes: Object.freeze(graph.nodes.map(freezeNode)),
    edges: Object.freeze(graph.edges.map(freezeEdge)),
    rootNodeIds: Object.freeze([...graph.rootNodeIds]),
    leafNodeIds: Object.freeze([...graph.leafNodeIds]),
    metadata: freezeMetadata(graph.metadata),
  });
}

export function freezeReasoning(reasoning: RoutingReasoning): RoutingReasoning {
  return Object.freeze({
    ...reasoning,
    decisions: Object.freeze(reasoning.decisions.map(freezeDecision)),
    rulesApplied: Object.freeze([...reasoning.rulesApplied]),
    metadata: freezeMetadata(reasoning.metadata),
  });
}

export function freezePolicy(policy: RoutingPolicy): RoutingPolicy {
  return Object.freeze({ ...policy });
}

export function freezeRequest(request: RoutingRequest): RoutingRequest {
  return Object.freeze({
    ...request,
    requiredCapabilities: Object.freeze(
      request.requiredCapabilities.map(freezeCapability),
    ),
    dependencies: Object.freeze(request.dependencies.map(freezeDependency)),
    constraints: Object.freeze(request.constraints.map(freezeConstraint)),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeContext(context: RoutingContext): RoutingContext {
  return Object.freeze({
    ...context,
    request: freezeRequest(context.request),
    capabilityIds: Object.freeze([...context.capabilityIds]),
    candidateAgentIds: Object.freeze([...context.candidateAgentIds]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeStatistics(
  statistics: RoutingStatistics,
): RoutingStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeSummary(summary: RoutingSummary): RoutingSummary {
  return Object.freeze({
    ...summary,
    agentIds: Object.freeze([...summary.agentIds]),
    capabilityIds: Object.freeze([...summary.capabilityIds]),
    phaseKinds: Object.freeze([...summary.phaseKinds]),
    statistics: freezeStatistics(summary.statistics),
  });
}

export function freezePlan(plan: RoutingPlan): RoutingPlan {
  return Object.freeze({
    ...plan,
    capabilities: Object.freeze(plan.capabilities.map(freezeCapability)),
    targets: Object.freeze(plan.targets.map(freezeTarget)),
    dependencies: Object.freeze(plan.dependencies.map(freezeDependency)),
    priorities: Object.freeze(plan.priorities.map(freezePriority)),
    phases: Object.freeze(plan.phases.map(freezePhase)),
    steps: Object.freeze(plan.steps.map(freezeStep)),
    executionOrder: freezeExecutionOrder(plan.executionOrder),
    graph: freezeGraph(plan.graph),
    decisions: Object.freeze(plan.decisions.map(freezeDecision)),
    constraints: Object.freeze(plan.constraints.map(freezeConstraint)),
    policies: Object.freeze(plan.policies.map(freezePolicy)),
    reasoning: freezeReasoning(plan.reasoning),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeSnapshot(snapshot: RoutingSnapshot): RoutingSnapshot {
  return Object.freeze({
    ...snapshot,
    plan: freezePlan(snapshot.plan),
    context: freezeContext(snapshot.context),
    summary: freezeSummary(snapshot.summary),
    statistics: freezeStatistics(snapshot.statistics),
    agentIds: Object.freeze([...snapshot.agentIds]),
    capabilityIds: Object.freeze([...snapshot.capabilityIds]),
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeEvent(event: RoutingEvent): RoutingEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezeResult(result: RoutingResult): RoutingResult {
  return Object.freeze({
    ...result,
    plan: result.plan ? freezePlan(result.plan) : null,
    context: result.context ? freezeContext(result.context) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    validation: freezeValidation(result.validation),
    error: freezeError(result.error),
    events: Object.freeze(result.events.map(freezeEvent)),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeRoutingState = Object.freeze({
  freezeMetadata,
  freezeValidation,
  freezeError,
  freezeCapability,
  freezeDependency,
  freezeConstraint,
  freezePriority,
  freezePhase,
  freezeTarget,
  freezeStep,
  freezeDecision,
  freezeNode,
  freezeEdge,
  freezeExecutionOrder,
  freezeGraph,
  freezeReasoning,
  freezePolicy,
  freezeRequest,
  freezeContext,
  freezeStatistics,
  freezeSummary,
  freezePlan,
  freezeSnapshot,
  freezeEvent,
  freezeResult,
});
