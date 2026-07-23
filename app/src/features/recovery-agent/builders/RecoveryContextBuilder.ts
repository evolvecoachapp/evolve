import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { EMPTY_RECOVERY_AGENT_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import { IntentSelector } from "../selectors/IntentSelector";
import { GoalSelector } from "../selectors/GoalSelector";
import { StrategySelector } from "../selectors/StrategySelector";
import { ConstraintSelector } from "../selectors/ConstraintSelector";
import {
  buildIndicatorsFromRequest,
  deriveStatesFromIndicators,
} from "../utils/RecoveryHelpers";
import { buildSleepProfile } from "../utils/SleepHelpers";
import { freezeContext, freezeProfile } from "../utils/FreezeRecoveryState";

export interface RecoveryContextBuilderInput {
  readonly request: RecoveryRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly clock?: () => string;
}

export class RecoveryContextBuilder {
  constructor(
    private readonly intentSelector = new IntentSelector(),
    private readonly goalSelector = new GoalSelector(),
    private readonly strategySelector = new StrategySelector(),
    private readonly constraintSelector = new ConstraintSelector(),
  ) {}

  build(input: RecoveryContextBuilderInput): RecoveryContext {
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
    const constraints = this.constraintSelector.select(
      input.request.constraints,
    );
    const indicators = buildIndicatorsFromRequest(input.request);
    const derived = deriveStatesFromIndicators(indicators);
    const sleep = buildSleepProfile(
      input.request.sleepHours ?? 7,
      indicators.sleepQuality,
    );

    const toolResultIds = input.toolExecutionResult
      ? Object.freeze([input.toolExecutionResult.id])
      : Object.freeze([] as string[]);

    return freezeContext({
      id: `rctx:${input.request.id}`,
      requestId: input.request.id,
      athleteId: input.request.athleteId,
      conversationId:
        input.request.conversationId ??
        input.conversationContext?.session.sessionId ??
        null,
      intent,
      goal,
      strategy,
      profile: freezeProfile({
        athleteId: input.request.athleteId,
        baselineRecoveryScore: indicators.recoveryScore,
        preferredProtocol: null,
        notes: Object.freeze([] as string[]),
      }),
      indicators,
      fatigue: derived.fatigue,
      readiness: derived.readiness,
      sleep,
      stress: derived.stress,
      trainingLoad: derived.trainingLoad,
      constraints,
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
        sharedWorkoutContext: false,
        sharedNutritionContext: false,
      }),
      metadata: EMPTY_RECOVERY_AGENT_METADATA,
      frozenAt: clock(),
    });
  }
}
