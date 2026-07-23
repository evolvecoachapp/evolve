import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutAgentMetadata } from "../models/WorkoutAgentMetadata";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutAgentSnapshot } from "../models/WorkoutAgentSnapshot";
import type { WorkoutAgentState } from "../models/WorkoutAgentState";
import type { WorkoutAgentStatistics } from "../models/WorkoutAgentStatistics";
import type { WorkoutConfidence } from "../models/WorkoutConfidence";
import type { WorkoutContext } from "../models/WorkoutContext";
import type { WorkoutConversation } from "../models/WorkoutConversation";
import type { WorkoutDecision } from "../models/WorkoutDecision";
import type { WorkoutExecutionContext } from "../models/WorkoutExecutionContext";
import type { WorkoutExplanation } from "../models/WorkoutExplanation";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutPlanningContext } from "../models/WorkoutPlanningContext";
import type { WorkoutPlanningResult } from "../models/WorkoutPlanningResult";
import type { WorkoutReasoning } from "../models/WorkoutReasoning";
import type { WorkoutRecommendation } from "../models/WorkoutRecommendation";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import type { WorkoutStrategy } from "../models/WorkoutStrategy";
import type {
  WorkoutValidation,
  WorkoutValidationIssue,
} from "../models/WorkoutValidation";

export function freezeMetadata(
  metadata: WorkoutAgentMetadata,
): WorkoutAgentMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeConfidence(
  confidence: WorkoutConfidence,
): WorkoutConfidence {
  return Object.freeze({ ...confidence });
}

export function freezeStrategy(strategy: WorkoutStrategy): WorkoutStrategy {
  return Object.freeze({
    ...strategy,
    tags: Object.freeze([...strategy.tags]),
  });
}

export function freezeRequest(request: WorkoutRequest): WorkoutRequest {
  return Object.freeze({
    ...request,
    constraints: Object.freeze([...request.constraints]),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeContext(context: WorkoutContext): WorkoutContext {
  return Object.freeze({
    ...context,
    constraints: Object.freeze([...context.constraints]),
    toolResultIds: Object.freeze([...context.toolResultIds]),
    attributes: Object.freeze({ ...context.attributes }),
    strategy: context.strategy ? freezeStrategy(context.strategy) : null,
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeReasoning(
  reasoning: WorkoutReasoning,
): WorkoutReasoning {
  return Object.freeze({
    ...reasoning,
    findings: Object.freeze([...reasoning.findings]),
    signals: Object.freeze({ ...reasoning.signals }),
    notes: Object.freeze([...reasoning.notes]),
  });
}

export function freezePlanningContext(
  ctx: WorkoutPlanningContext,
): WorkoutPlanningContext {
  return Object.freeze({
    ...ctx,
    reasoning: Object.freeze(ctx.reasoning.map(freezeReasoning)),
    metadata: freezeMetadata(ctx.metadata),
  });
}

export function freezeProposal(
  proposal: WorkoutPlanProposal,
): WorkoutPlanProposal {
  return Object.freeze({
    ...proposal,
    primaryLifts: Object.freeze([...proposal.primaryLifts]),
    accessories: Object.freeze([...proposal.accessories]),
    recoveryNotes: Object.freeze([...proposal.recoveryNotes]),
    rationale: Object.freeze([...proposal.rationale]),
    confidence: freezeConfidence(proposal.confidence),
    metadata: freezeMetadata(proposal.metadata),
  });
}

export function freezePlanningResult(
  result: WorkoutPlanningResult,
): WorkoutPlanningResult {
  return Object.freeze({
    ...result,
    planningContext: freezePlanningContext(result.planningContext),
    proposal: freezeProposal(result.proposal),
    plannerIds: Object.freeze([...result.plannerIds]),
  });
}

export function freezeDecision(decision: WorkoutDecision): WorkoutDecision {
  return Object.freeze({
    ...decision,
    proposal: decision.proposal ? freezeProposal(decision.proposal) : null,
    confidence: freezeConfidence(decision.confidence),
    reasons: Object.freeze([...decision.reasons]),
    policyFlags: Object.freeze([...decision.policyFlags]),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeRecommendation(
  recommendation: WorkoutRecommendation,
): WorkoutRecommendation {
  return Object.freeze({
    ...recommendation,
    confidence: freezeConfidence(recommendation.confidence),
    relatedExerciseIds: Object.freeze([...recommendation.relatedExerciseIds]),
  });
}

export function freezeExplanation(
  explanation: WorkoutExplanation,
): WorkoutExplanation {
  return Object.freeze({
    ...explanation,
    bullets: Object.freeze([...explanation.bullets]),
    policyNotes: Object.freeze([...explanation.policyNotes]),
  });
}

export function freezeConversation(
  conversation: WorkoutConversation,
): WorkoutConversation {
  return Object.freeze({ ...conversation });
}

export function freezeExecutionContext(
  ctx: WorkoutExecutionContext,
): WorkoutExecutionContext {
  return Object.freeze({
    ...ctx,
    context: freezeContext(ctx.context),
    pendingToolIds: Object.freeze([...ctx.pendingToolIds]),
    metadata: freezeMetadata(ctx.metadata),
  });
}

export function freezeStatistics(
  stats: WorkoutAgentStatistics,
): WorkoutAgentStatistics {
  return Object.freeze({ ...stats });
}

export function freezeValidationIssue(
  issue: WorkoutValidationIssue,
): WorkoutValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: WorkoutValidation,
): WorkoutValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeAgentState(state: WorkoutAgentState): WorkoutAgentState {
  return Object.freeze({ ...state });
}

export function freezeSnapshot(
  snapshot: WorkoutAgentSnapshot,
): WorkoutAgentSnapshot {
  return Object.freeze({
    ...snapshot,
    decision: snapshot.decision ? freezeDecision(snapshot.decision) : null,
    proposal: snapshot.proposal ? freezeProposal(snapshot.proposal) : null,
    explanation: snapshot.explanation
      ? freezeExplanation(snapshot.explanation)
      : null,
    statistics: freezeStatistics(snapshot.statistics),
  });
}

export function freezeAgent(agent: WorkoutAgent): WorkoutAgent {
  return Object.freeze({
    ...agent,
    capabilities: Object.freeze([...agent.capabilities]),
    strategyIds: Object.freeze([...agent.strategyIds]),
    policyIds: Object.freeze([...agent.policyIds]),
    reasonerIds: Object.freeze([...agent.reasonerIds]),
    plannerIds: Object.freeze([...agent.plannerIds]),
    metadata: freezeMetadata(agent.metadata),
  });
}

export function freezeAgentResult(
  result: WorkoutAgentResult,
): WorkoutAgentResult {
  return Object.freeze({
    ...result,
    request: freezeRequest(result.request),
    context: freezeContext(result.context),
    conversation: freezeConversation(result.conversation),
    reasoning: Object.freeze(result.reasoning.map(freezeReasoning)),
    decision: freezeDecision(result.decision),
    recommendations: Object.freeze(
      result.recommendations.map(freezeRecommendation),
    ),
    explanation: freezeExplanation(result.explanation),
    validation: freezeValidation(result.validation),
    snapshot: freezeSnapshot(result.snapshot),
    statistics: freezeStatistics(result.statistics),
    domainInvocations: Object.freeze(
      (result.domainInvocations ?? []).map((invocation) =>
        Object.freeze({
          ...invocation,
          attributes: Object.freeze({ ...invocation.attributes }),
        }),
      ),
    ),
    metadata: freezeMetadata(result.metadata),
  });
}

/** Alias matching sprint utility naming. */
export const FreezeAgentState = Object.freeze({
  freezeAgentState,
  freezeAgentResult,
  freezeContext,
  freezeDecision,
  freezeProposal,
});
