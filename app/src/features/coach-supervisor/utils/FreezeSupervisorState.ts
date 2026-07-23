import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { AggregationContext } from "../models/AggregationContext";
import type { AggregationResult } from "../models/AggregationResult";
import type { CoachSupervisor } from "../models/CoachSupervisor";
import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import type { CoachSupervisorDecision } from "../models/CoachSupervisorDecision";
import type { CoachSupervisorError } from "../models/CoachSupervisorError";
import type { CoachSupervisorEvent } from "../models/CoachSupervisorEvent";
import type { CoachSupervisorExecution } from "../models/CoachSupervisorExecution";
import type { CoachSupervisorMetadata } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorResult } from "../models/CoachSupervisorResult";
import type { CoachSupervisorSession } from "../models/CoachSupervisorSession";
import type { CoachSupervisorSnapshot } from "../models/CoachSupervisorSnapshot";
import type { CoachSupervisorState } from "../models/CoachSupervisorState";
import type { CoachSupervisorStatistics } from "../models/CoachSupervisorStatistics";
import type { CoachSupervisorSummary } from "../models/CoachSupervisorSummary";
import type {
  CoachSupervisorValidation,
  CoachSupervisorValidationIssue,
} from "../models/CoachSupervisorValidation";
import type { CoordinationContext } from "../models/CoordinationContext";
import type { CoordinationPhase } from "../models/CoordinationPhase";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import type { CoordinationStep } from "../models/CoordinationStep";
import type { SupervisorConfidence } from "../models/SupervisorConfidence";
import type { SupervisorDiagnostics } from "../models/SupervisorDiagnostics";
import type { SupervisorReasoning } from "../models/SupervisorReasoning";
import type { UnifiedCoachResponse } from "../models/UnifiedCoachResponse";

export function freezeMetadata(
  metadata: CoachSupervisorMetadata,
): CoachSupervisorMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeValidationIssue(
  issue: CoachSupervisorValidationIssue,
): CoachSupervisorValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: CoachSupervisorValidation,
): CoachSupervisorValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeError(
  error: CoachSupervisorError | null,
): CoachSupervisorError | null {
  return error ? Object.freeze({ ...error }) : null;
}

export function freezeConfidence(
  confidence: SupervisorConfidence,
): SupervisorConfidence {
  return Object.freeze({ ...confidence });
}

export function freezeReasoning(
  reasoning: SupervisorReasoning,
): SupervisorReasoning {
  return Object.freeze({
    summary: reasoning.summary,
    steps: Object.freeze([...reasoning.steps]),
    notes: Object.freeze([...reasoning.notes]),
  });
}

export function freezeDiagnostics(
  diagnostics: SupervisorDiagnostics,
): SupervisorDiagnostics {
  return Object.freeze({
    ...diagnostics,
    warnings: Object.freeze([...diagnostics.warnings]),
    notes: Object.freeze([...diagnostics.notes]),
    metadata: freezeMetadata(diagnostics.metadata),
  });
}

export function freezeRequest(
  request: CoachSupervisorRequest,
): CoachSupervisorRequest {
  return Object.freeze({
    ...request,
    requiredCapabilityIds: Object.freeze([...request.requiredCapabilityIds]),
    preferredAgentIds: Object.freeze([...request.preferredAgentIds]),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeStep(step: CoordinationStep): CoordinationStep {
  return Object.freeze({
    ...step,
    dependsOnStepIds: Object.freeze([...step.dependsOnStepIds]),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezePhase(phase: CoordinationPhase): CoordinationPhase {
  return Object.freeze({
    ...phase,
    stepIds: Object.freeze([...phase.stepIds]),
  });
}

export function freezeCoordinationContext(
  context: CoordinationContext,
): CoordinationContext {
  return Object.freeze({
    ...context,
    request: freezeRequest(context.request),
    agentIds: Object.freeze([...context.agentIds]),
    capabilityIds: Object.freeze([...context.capabilityIds]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeCoordinationPlan(plan: CoordinationPlan): CoordinationPlan {
  return Object.freeze({
    ...plan,
    context: freezeCoordinationContext(plan.context),
    steps: Object.freeze(plan.steps.map(freezeStep)),
    phases: Object.freeze(plan.phases.map(freezePhase)),
    orderedAgentIds: Object.freeze([...plan.orderedAgentIds]),
    orderedCapabilityIds: Object.freeze([...plan.orderedCapabilityIds]),
    reasoning: freezeReasoning(plan.reasoning),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeDecision(
  decision: CoachSupervisorDecision,
): CoachSupervisorDecision {
  return Object.freeze({
    ...decision,
    selectedAgentIds: Object.freeze([...decision.selectedAgentIds]),
    selectedCapabilityIds: Object.freeze([...decision.selectedCapabilityIds]),
    confidence: freezeConfidence(decision.confidence),
    reasoning: freezeReasoning(decision.reasoning),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezePlan(plan: CoachSupervisorPlan): CoachSupervisorPlan {
  return Object.freeze({
    ...plan,
    coordination: freezeCoordinationPlan(plan.coordination),
    decision: freezeDecision(plan.decision),
    reasoning: freezeReasoning(plan.reasoning),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeContext(
  context: CoachSupervisorContext,
): CoachSupervisorContext {
  return Object.freeze({
    ...context,
    request: freezeRequest(context.request),
    selectedAgentIds: Object.freeze([...context.selectedAgentIds]),
    selectedCapabilityIds: Object.freeze([...context.selectedCapabilityIds]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeAgentSummary(
  summary: AgentExecutionSummary,
): AgentExecutionSummary {
  return Object.freeze({
    ...summary,
    metadata: freezeMetadata(summary.metadata),
  });
}

export function freezeExecution(
  execution: CoachSupervisorExecution,
): CoachSupervisorExecution {
  return Object.freeze({
    ...execution,
    agentSummaries: Object.freeze(execution.agentSummaries.map(freezeAgentSummary)),
    metadata: freezeMetadata(execution.metadata),
  });
}

export function freezeAggregationContext(
  context: AggregationContext,
): AggregationContext {
  return Object.freeze({
    ...context,
    plan: freezeCoordinationPlan(context.plan),
    summaries: Object.freeze(context.summaries.map(freezeAgentSummary)),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeAggregationResult(
  result: AggregationResult,
): AggregationResult {
  return Object.freeze({
    ...result,
    summaries: Object.freeze(result.summaries.map(freezeAgentSummary)),
    orderedAgentIds: Object.freeze([...result.orderedAgentIds]),
    provenance: Object.freeze([...result.provenance]),
    explanations: Object.freeze([...result.explanations]),
    conflicts: Object.freeze([...result.conflicts]),
    diagnostics: freezeDiagnostics(result.diagnostics),
    metadata: freezeMetadata(result.metadata),
  });
}

export function freezeResponse(
  response: UnifiedCoachResponse,
): UnifiedCoachResponse {
  return Object.freeze({
    ...response,
    sections: Object.freeze([...response.sections]),
    agentIds: Object.freeze([...response.agentIds]),
    capabilityIds: Object.freeze([...response.capabilityIds]),
    aggregation: freezeAggregationResult(response.aggregation),
    confidence: freezeConfidence(response.confidence),
    reasoning: freezeReasoning(response.reasoning),
    diagnostics: freezeDiagnostics(response.diagnostics),
    metadata: freezeMetadata(response.metadata),
  });
}

export function freezeStatistics(
  statistics: CoachSupervisorStatistics,
): CoachSupervisorStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeSummary(
  summary: CoachSupervisorSummary,
): CoachSupervisorSummary {
  return Object.freeze({
    ...summary,
    details: Object.freeze([...summary.details]),
    statistics: freezeStatistics(summary.statistics),
  });
}

export function freezeSnapshot(
  snapshot: CoachSupervisorSnapshot,
): CoachSupervisorSnapshot {
  return Object.freeze({
    ...snapshot,
    request: freezeRequest(snapshot.request),
    context: snapshot.context ? freezeContext(snapshot.context) : null,
    plan: snapshot.plan ? freezePlan(snapshot.plan) : null,
    execution: snapshot.execution ? freezeExecution(snapshot.execution) : null,
    aggregation: snapshot.aggregation
      ? freezeAggregationResult(snapshot.aggregation)
      : null,
    response: snapshot.response ? freezeResponse(snapshot.response) : null,
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    agentIds: Object.freeze([...snapshot.agentIds]),
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeEvent(event: CoachSupervisorEvent): CoachSupervisorEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezeState(state: CoachSupervisorState): CoachSupervisorState {
  return Object.freeze({
    ...state,
    metadata: freezeMetadata(state.metadata),
  });
}

export function freezeSession(
  session: CoachSupervisorSession,
): CoachSupervisorSession {
  return Object.freeze({
    ...session,
    state: freezeState(session.state),
    metadata: freezeMetadata(session.metadata),
  });
}

export function freezeSupervisor(
  supervisor: CoachSupervisor,
): CoachSupervisor {
  return Object.freeze({
    ...supervisor,
    capabilities: Object.freeze([...supervisor.capabilities]),
    supportedDomains: Object.freeze([...supervisor.supportedDomains]),
    metadata: freezeMetadata(supervisor.metadata),
  });
}

export function freezeResult(result: CoachSupervisorResult): CoachSupervisorResult {
  return Object.freeze({
    ...result,
    request: result.request ? freezeRequest(result.request) : null,
    context: result.context ? freezeContext(result.context) : null,
    plan: result.plan ? freezePlan(result.plan) : null,
    execution: result.execution ? freezeExecution(result.execution) : null,
    aggregation: result.aggregation
      ? freezeAggregationResult(result.aggregation)
      : null,
    response: result.response ? freezeResponse(result.response) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    validation: freezeValidation(result.validation),
    error: freezeError(result.error),
    events: Object.freeze(result.events.map(freezeEvent)),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeSupervisorState = Object.freeze({
  freezeMetadata,
  freezeRequest,
  freezePlan,
  freezeCoordinationPlan,
  freezeContext,
  freezeExecution,
  freezeAggregationResult,
  freezeResponse,
  freezeResult,
  freezeState,
  freezeSession,
  freezeSupervisor,
});
