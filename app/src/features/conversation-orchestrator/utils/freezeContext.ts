import type { ConversationConstraint } from "../models/ConversationConstraint";
import type { ConversationContext } from "../models/ConversationContext";
import type { ConversationEngineResult } from "../models/ConversationEngineResult";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import type { ConversationGoal } from "../models/ConversationGoal";
import type { ConversationKnowledge } from "../models/ConversationKnowledge";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationMetadata } from "../models/ConversationMetadata";
import type { ConversationPreparation } from "../models/ConversationPreparation";
import type { ConversationReason } from "../models/ConversationReason";
import type { ConversationRequest } from "../models/ConversationRequest";
import type { ConversationResponsePlaceholder } from "../models/ConversationResponsePlaceholder";
import type { ConversationSession } from "../models/ConversationSession";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationSummary } from "../models/ConversationSummary";
import type { ConversationTurn } from "../models/ConversationTurn";

function freezeReason(reason: ConversationReason): ConversationReason {
  return Object.freeze({
    ...reason,
    attributes: Object.freeze({ ...reason.attributes }),
  });
}

function freezeMetadata(metadata: ConversationMetadata): ConversationMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeGoal(goal: ConversationGoal): ConversationGoal {
  return Object.freeze({
    ...goal,
    reason: freezeReason(goal.reason),
    evidenceIds: Object.freeze([...goal.evidenceIds]),
    objectiveIds: Object.freeze([...goal.objectiveIds]),
    metadata: freezeMetadata(goal.metadata),
  });
}

export function freezeConstraint(
  constraint: ConversationConstraint,
): ConversationConstraint {
  return Object.freeze({
    ...constraint,
    reason: freezeReason(constraint.reason),
  });
}

export function freezeEvidence(
  evidence: ConversationEvidence,
): ConversationEvidence {
  return Object.freeze({
    ...evidence,
    attributes: Object.freeze({ ...evidence.attributes }),
  });
}

export function freezeMessage(
  message: ConversationMessage,
): ConversationMessage {
  return Object.freeze({
    ...message,
    goalIds: Object.freeze([...message.goalIds]),
    evidenceIds: Object.freeze([...message.evidenceIds]),
    metadata: freezeMetadata(message.metadata),
  });
}

export function freezeTurn(turn: ConversationTurn): ConversationTurn {
  return Object.freeze({
    ...turn,
    goalIds: Object.freeze([...turn.goalIds]),
    messageIds: Object.freeze([...turn.messageIds]),
  });
}

export function freezeKnowledge(
  knowledge: ConversationKnowledge,
): ConversationKnowledge {
  return Object.freeze({
    ...knowledge,
    objectiveIds: Object.freeze([...knowledge.objectiveIds]),
    selectedObjectiveIds: Object.freeze([...knowledge.selectedObjectiveIds]),
    insightIds: Object.freeze([...knowledge.insightIds]),
    attributes: Object.freeze({ ...knowledge.attributes }),
  });
}

export function freezePreparation(
  preparation: ConversationPreparation,
): ConversationPreparation {
  return Object.freeze({
    ...preparation,
    selectorNames: Object.freeze([...preparation.selectorNames]),
    missingInformation: Object.freeze([...preparation.missingInformation]),
  });
}

export function freezeSession(
  session: ConversationSession,
): ConversationSession {
  return Object.freeze({ ...session });
}

export function freezeRequest(
  request: ConversationRequest,
): ConversationRequest {
  return Object.freeze({
    ...request,
    goalIds: Object.freeze([...request.goalIds]),
    constraintIds: Object.freeze([...request.constraintIds]),
    evidenceIds: Object.freeze([...request.evidenceIds]),
    knowledgeRefs: Object.freeze([...request.knowledgeRefs]),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeResponsePlaceholder(
  placeholder: ConversationResponsePlaceholder,
): ConversationResponsePlaceholder {
  return Object.freeze({ ...placeholder });
}

export function freezeConversationSummary(
  summary: ConversationSummary,
): ConversationSummary {
  return Object.freeze({
    ...summary,
    topGoalIds: Object.freeze([...summary.topGoalIds]),
  });
}

/**
 * Deep-freeze a conversation context for immutability guarantees.
 */
export function freezeContext(
  context: ConversationContext,
): ConversationContext {
  return Object.freeze({
    ...context,
    session: freezeSession(context.session),
    goals: Object.freeze(context.goals.map(freezeGoal)),
    constraints: Object.freeze(context.constraints.map(freezeConstraint)),
    evidence: Object.freeze(context.evidence.map(freezeEvidence)),
    knowledge: freezeKnowledge(context.knowledge),
    messages: Object.freeze(context.messages.map(freezeMessage)),
    turns: Object.freeze(context.turns.map(freezeTurn)),
    request: freezeRequest(context.request),
    responsePlaceholder: freezeResponsePlaceholder(
      context.responsePlaceholder,
    ),
    preparation: freezePreparation(context.preparation),
    metadata: freezeMetadata(context.metadata),
    summary: freezeConversationSummary(context.summary),
  });
}

export function freezeSnapshot(
  snapshot: ConversationSnapshot,
): ConversationSnapshot {
  return Object.freeze({
    ...snapshot,
    context: freezeContext(snapshot.context),
    summary: freezeConversationSummary(snapshot.summary),
  });
}

export function freezeEngineResult(
  result: ConversationEngineResult,
): ConversationEngineResult {
  return Object.freeze({
    snapshot: freezeSnapshot(result.snapshot),
    context: freezeContext(result.context),
    summary: freezeConversationSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
