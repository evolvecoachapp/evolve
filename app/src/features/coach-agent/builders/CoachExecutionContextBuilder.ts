import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { CoachExecutionContext } from "../models/CoachExecutionContext";
import type { CoachIntent } from "../models/CoachIntent";
import type { CoachRequest } from "../models/CoachRequest";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import { freezeExecutionContext } from "../utils/FreezeCoachState";

export interface CoachExecutionContextBuilderInput {
  readonly id: string;
  readonly request: CoachRequest;
  readonly intent: CoachIntent;
  readonly selectedAgents: readonly SpecialistAgentKind[];
  readonly createdAt: string;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
}

/**
 * Builds an immutable CoachExecutionContext.
 */
export class CoachExecutionContextBuilder {
  build(input: CoachExecutionContextBuilderInput): CoachExecutionContext {
    return freezeExecutionContext({
      id: input.id,
      requestId: input.request.id,
      athleteId: input.request.athleteId,
      conversationId: input.request.conversationId,
      intent: input.intent,
      selectedAgents: Object.freeze([...input.selectedAgents]),
      request: input.request,
      conversationContext: input.conversationContext ?? null,
      coachResponse: input.coachResponse ?? null,
      actionPlan: input.actionPlan ?? null,
      toolExecutionResult: input.toolExecutionResult ?? null,
      memoryTurnCount: input.memoryTurnCount ?? 0,
      metadata: EMPTY_COACH_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function buildCoachExecutionContext(
  input: CoachExecutionContextBuilderInput,
): CoachExecutionContext {
  return new CoachExecutionContextBuilder().build(input);
}
