import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionRequest } from "../models/NutritionRequest";
import { NutritionActivityLevels } from "../models/NutritionRequest";
import { IntentSelector } from "../selectors/IntentSelector";
import { GoalSelector } from "../selectors/GoalSelector";
import { StrategySelector } from "../selectors/StrategySelector";
import { PreferenceSelector } from "../selectors/PreferenceSelector";
import { ConstraintSelector } from "../selectors/ConstraintSelector";
import { buildBodyCompositionState } from "../utils/BodyCompositionHelpers";
import { freezeContext } from "../utils/FreezeNutritionState";

export interface NutritionContextBuilderInput {
  readonly request: NutritionRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly clock?: () => string;
}

export class NutritionContextBuilder {
  constructor(
    private readonly intentSelector = new IntentSelector(),
    private readonly goalSelector = new GoalSelector(),
    private readonly strategySelector = new StrategySelector(),
    private readonly preferenceSelector = new PreferenceSelector(),
    private readonly constraintSelector = new ConstraintSelector(),
  ) {}

  build(input: NutritionContextBuilderInput): NutritionContext {
    const clock = input.clock ?? (() => new Date().toISOString());
    const message =
      input.request.message ||
      input.conversationContext?.summary.summaryText ||
      "";
    const intent = this.intentSelector.select({
      intentHint: input.request.intentHint,
      message,
    });
    const goal = this.goalSelector.select({
      goalHint: input.request.goalHint,
      intent,
      message,
    });
    const strategy = this.strategySelector.select(goal);
    const preferences = this.preferenceSelector.select(input.request.preferences);
    const constraints = this.constraintSelector.select(input.request.constraints);
    const bodyWeightKg = input.request.bodyWeightKg ?? 75;
    const activityLevel =
      input.request.activityLevel ?? NutritionActivityLevels.MODERATE;

    const toolResultIds = input.toolExecutionResult
      ? Object.freeze([input.toolExecutionResult.id])
      : Object.freeze([] as string[]);

    return freezeContext({
      id: `nctx:${input.request.id}`,
      requestId: input.request.id,
      athleteId: input.request.athleteId,
      conversationId:
        input.request.conversationId ??
        input.conversationContext?.session.sessionId ??
        null,
      intent,
      goal,
      strategy,
      bodyWeightKg,
      activityLevel,
      constraints,
      preferences,
      bodyComposition: buildBodyCompositionState(goal),
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
      metadata: EMPTY_NUTRITION_AGENT_METADATA,
      frozenAt: clock(),
    });
  }
}
