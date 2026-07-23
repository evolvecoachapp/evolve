import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { CoachIntent } from "./CoachIntent";
import type { CoachMetadata } from "./CoachMetadata";
import type { CoachRequest } from "./CoachRequest";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

/**
 * Immutable execution context for a Coach Agent run.
 */
export interface CoachExecutionContext {
  readonly id: string;
  readonly requestId: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly intent: CoachIntent;
  readonly selectedAgents: readonly SpecialistAgentKind[];
  readonly request: CoachRequest;
  readonly conversationContext: ConversationContext | null;
  readonly coachResponse: CoachResponse | null;
  readonly actionPlan: ActionPlan | null;
  readonly toolExecutionResult: ToolExecutionResult | null;
  readonly memoryTurnCount: number;
  readonly metadata: CoachMetadata;
  readonly createdAt: string;
}
