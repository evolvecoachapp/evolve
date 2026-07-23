import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import type { WorkoutContext } from "../models/WorkoutContext";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import { WorkoutExperienceLevels } from "../models/WorkoutRequest";
import { IntentSelector } from "../selectors/IntentSelector";
import { ObjectiveSelector } from "../selectors/ObjectiveSelector";
import { StrategySelector } from "../selectors/StrategySelector";
import { freezeContext } from "../utils/freezeAgentState";

export interface WorkoutContextBuilderInput {
  readonly request: WorkoutRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly clock?: () => string;
}

export class WorkoutContextBuilder {
  constructor(
    private readonly intentSelector = new IntentSelector(),
    private readonly objectiveSelector = new ObjectiveSelector(),
    private readonly strategySelector = new StrategySelector(),
  ) {}

  build(input: WorkoutContextBuilderInput): WorkoutContext {
    const clock = input.clock ?? (() => new Date().toISOString());
    const message =
      input.request.message ||
      input.conversationContext?.summary.summaryText ||
      "";
    const intent = this.intentSelector.select({
      intentHint: input.request.intentHint,
      message,
    });
    const objective = this.objectiveSelector.select({
      objectiveHint: input.request.objectiveHint,
      intent,
      message,
    });
    const strategy = this.strategySelector.select(objective);
    const daysPerWeek = clampDays(
      input.request.daysPerWeek ??
        readDaysFromConversation(input.conversationContext) ??
        4,
    );
    const experienceLevel =
      input.request.experienceLevel ?? WorkoutExperienceLevels.INTERMEDIATE;

    const toolResultIds = input.toolExecutionResult
      ? Object.freeze([input.toolExecutionResult.id])
      : Object.freeze([] as string[]);

    return freezeContext({
      id: `wctx:${input.request.id}`,
      requestId: input.request.id,
      athleteId: input.request.athleteId,
      conversationId:
        input.request.conversationId ??
        input.conversationContext?.session.sessionId ??
        null,
      intent,
      objective,
      strategy,
      daysPerWeek,
      experienceLevel,
      constraints: Object.freeze([...input.request.constraints]),
      conversationSummary:
        input.conversationContext?.summary.summaryText ?? null,
      coachResponseId: input.coachResponse?.id ?? null,
      actionPlanId: input.actionPlan?.id ?? null,
      toolResultIds,
      memoryTurnCount: input.memoryTurnCount ?? 0,
      attributes: Object.freeze({
        hasCoachResponse: Boolean(input.coachResponse),
        hasActionPlan: Boolean(input.actionPlan),
        hasToolResult: Boolean(input.toolExecutionResult),
        coachIntent: input.coachResponse?.intent ?? null,
      }),
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      frozenAt: clock(),
    });
  }
}

function clampDays(n: number): number {
  return Math.min(7, Math.max(1, Math.round(n)));
}

function readDaysFromConversation(
  ctx: ConversationContext | null | undefined,
): number | null {
  if (!ctx) return null;
  const attr = ctx.metadata.attributes?.daysPerWeek;
  return typeof attr === "number" ? attr : null;
}
