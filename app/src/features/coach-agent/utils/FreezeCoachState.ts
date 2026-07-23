import type { CoachAgent } from "../models/CoachAgent";
import type { CoachAgentResult } from "../models/CoachAgentResult";
import type { CoachDecision, CoachRecommendation, CoachConflict } from "../models/CoachDecision";
import type { CoachExecutionContext } from "../models/CoachExecutionContext";
import type { CoachExecutionEvent } from "../models/CoachExecutionEvent";
import type { CoachExecutionPlan, CoachExecutionStep } from "../models/CoachExecutionPlan";
import type { CoachExecutionState } from "../models/CoachExecutionState";
import type { CoachMetadata } from "../models/CoachMetadata";
import type { CoachRequest } from "../models/CoachRequest";
import type { CoachSummary } from "../models/CoachSummary";
import type {
  CoachValidation,
  CoachValidationIssue,
  CoachEvaluation,
} from "../models/CoachValidation";
import type {
  SpecialistAgentInvocation,
  SpecialistAgentOutputs,
} from "../models/SpecialistAgentInvocation";

export function freezeMetadata(metadata: CoachMetadata): CoachMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeValidationIssue(
  issue: CoachValidationIssue,
): CoachValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(validation: CoachValidation): CoachValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeRequest(request: CoachRequest): CoachRequest {
  return Object.freeze({
    ...request,
    agentHints: Object.freeze([...request.agentHints]),
    constraints: Object.freeze([...request.constraints]),
    metadata: freezeMetadata(request.metadata),
    workoutRequest: request.workoutRequest
      ? Object.freeze({ ...request.workoutRequest })
      : null,
    recoveryRequest: request.recoveryRequest
      ? Object.freeze({ ...request.recoveryRequest })
      : null,
    nutritionRequest: request.nutritionRequest
      ? Object.freeze({ ...request.nutritionRequest })
      : null,
  });
}

export function freezeExecutionStep(
  step: CoachExecutionStep,
): CoachExecutionStep {
  return Object.freeze({ ...step });
}

export function freezeExecutionPlan(
  plan: CoachExecutionPlan,
): CoachExecutionPlan {
  return Object.freeze({
    ...plan,
    steps: Object.freeze(plan.steps.map(freezeExecutionStep)),
    agentKinds: Object.freeze([...plan.agentKinds]),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeExecutionContext(
  context: CoachExecutionContext,
): CoachExecutionContext {
  return Object.freeze({
    ...context,
    selectedAgents: Object.freeze([...context.selectedAgents]),
    request: freezeRequest(context.request),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeExecutionState(
  state: CoachExecutionState,
): CoachExecutionState {
  return Object.freeze({
    ...state,
    metadata: freezeMetadata(state.metadata),
  });
}

export function freezeExecutionEvent(
  event: CoachExecutionEvent,
): CoachExecutionEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezeRecommendation(
  recommendation: CoachRecommendation,
): CoachRecommendation {
  return Object.freeze({ ...recommendation });
}

export function freezeConflict(conflict: CoachConflict): CoachConflict {
  return Object.freeze({
    ...conflict,
    agents: Object.freeze([...conflict.agents]),
  });
}

export function freezeDecision(decision: CoachDecision): CoachDecision {
  return Object.freeze({
    ...decision,
    recommendations: Object.freeze(
      decision.recommendations.map(freezeRecommendation),
    ),
    conflicts: Object.freeze(decision.conflicts.map(freezeConflict)),
    prioritizedAgents: Object.freeze([...decision.prioritizedAgents]),
    reasons: Object.freeze([...decision.reasons]),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeInvocation(
  invocation: SpecialistAgentInvocation,
): SpecialistAgentInvocation {
  return Object.freeze({
    ...invocation,
    attributes: Object.freeze({ ...invocation.attributes }),
  });
}

export function freezeOutputs(
  outputs: SpecialistAgentOutputs,
): SpecialistAgentOutputs {
  return Object.freeze({
    workout: outputs.workout,
    recovery: outputs.recovery,
    nutrition: outputs.nutrition,
    invocations: Object.freeze(outputs.invocations.map(freezeInvocation)),
    metadata: freezeMetadata(outputs.metadata),
  });
}

export function freezeSummary(summary: CoachSummary): CoachSummary {
  return Object.freeze({
    ...summary,
    agentsInvoked: Object.freeze([...summary.agentsInvoked]),
  });
}

export function freezeEvaluation(evaluation: CoachEvaluation): CoachEvaluation {
  return Object.freeze({
    ...evaluation,
    validation: freezeValidation(evaluation.validation),
    findings: Object.freeze([...evaluation.findings]),
    agentsEvaluated: Object.freeze([...evaluation.agentsEvaluated]),
    metadata: freezeMetadata(evaluation.metadata),
  });
}

export function freezeAgent(agent: CoachAgent): CoachAgent {
  return Object.freeze({
    ...agent,
    capabilities: Object.freeze([...agent.capabilities]),
    supportedAgents: Object.freeze([...agent.supportedAgents]),
    futureAgents: Object.freeze([...agent.futureAgents]),
    metadata: freezeMetadata(agent.metadata),
  });
}

export function freezeAgentResult(result: CoachAgentResult): CoachAgentResult {
  return Object.freeze({
    ...result,
    request: freezeRequest(result.request),
    context: freezeExecutionContext(result.context),
    plan: freezeExecutionPlan(result.plan),
    outputs: freezeOutputs(result.outputs),
    decision: freezeDecision(result.decision),
    validation: freezeValidation(result.validation),
    summary: freezeSummary(result.summary),
    events: Object.freeze(result.events.map(freezeExecutionEvent)),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeCoachState = Object.freeze({
  freezeAgent,
  freezeAgentResult,
  freezeRequest,
  freezeExecutionContext,
  freezeExecutionPlan,
  freezeDecision,
  freezeValidation,
  freezeEvaluation,
  freezeSummary,
});
