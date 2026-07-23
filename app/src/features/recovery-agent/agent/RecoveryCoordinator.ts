import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { RecoveryPlanBuilder } from "../builders/RecoveryPlanBuilder";
import { RecoveryRecommendationBuilder } from "../builders/RecoveryRecommendationBuilder";
import { EMPTY_RECOVERY_AGENT_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryAgentResult } from "../models/RecoveryAgentResult";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import { RecoveryAgentStatuses } from "../models/RecoveryAgentStatus";
import { labelFromScore } from "../models/RecoveryConfidence";
import { createDefaultReasoners } from "../reasoning";
import {
  DefaultDeloadPolicy,
  DefaultFatiguePolicy,
  DefaultRecoveryPolicy,
  DefaultSafetyPolicy,
  DefaultSleepPolicy,
  DefaultStressPolicy,
  DefaultTrainingLoadPolicy,
  DefaultWellnessPolicy,
} from "../policies";
import { validateRecommendations } from "../validators/validateRecommendations";
import { validateRecoveryPlan } from "../validators/validateRecoveryPlan";
import { validateConstraints } from "../validators/validateSafetyAndConsistency";
import {
  freezeAgentResult,
  freezeConversation,
  freezeDecision,
  freezeExplanation,
  freezeSnapshot,
  freezeValidation,
} from "../utils/FreezeRecoveryState";
import { computeAgentStatistics } from "../utils/statisticsHelpers";
import { RecoveryAgentSession } from "./RecoverySession";
import { RecoveryAgentStateManager } from "./RecoveryState";

export interface RecoveryAgentCoordinatorDeps {
  readonly clock?: () => string;
  readonly nowMs?: () => number;
  readonly session?: RecoveryAgentSession;
}

/**
 * Coordinates reason → plan → policy → validate → result.
 * No AI. No providers. No tool execution.
 */
export class RecoveryAgentCoordinator {
  private readonly clock: () => string;
  private readonly nowMs: () => number;
  private readonly session: RecoveryAgentSession;
  private readonly stateManager: RecoveryAgentStateManager;
  private readonly contextBuilder = new RecoveryContextBuilder();
  private readonly planBuilder = new RecoveryPlanBuilder();
  private readonly recommendationBuilder = new RecoveryRecommendationBuilder();

  constructor(deps: RecoveryAgentCoordinatorDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
    this.session =
      deps.session ??
      new RecoveryAgentSession("session:recovery:default", this.clock);
    this.stateManager = new RecoveryAgentStateManager(this.session);
  }

  getSession(): RecoveryAgentSession {
    return this.session;
  }

  process(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryAgentResult {
    const startedAt = this.clock();
    const startMs = this.nowMs();

    this.stateManager.update(
      {
        status: RecoveryAgentStatuses.PREPARING,
        requestId: input.request.id,
        errorMessage: null,
      },
      this.clock,
    );

    const context = this.contextBuilder.build({
      request: input.request,
      conversationContext: input.conversationContext,
      coachResponse: input.coachResponse,
      actionPlan: input.actionPlan,
      toolExecutionResult: input.toolExecutionResult,
      memoryTurnCount: input.memoryTurnCount,
      clock: this.clock,
    });

    this.stateManager.update(
      {
        status: RecoveryAgentStatuses.REASONING,
        contextId: context.id,
      },
      this.clock,
    );

    const reasoning = Object.freeze(
      createDefaultReasoners().map((r) => r.reason(context)),
    );

    this.stateManager.update(
      { status: RecoveryAgentStatuses.PLANNING },
      this.clock,
    );

    const planning = this.planBuilder.build({
      context,
      reasoning,
      clock: this.clock,
    });
    const plan = planning.plan;

    this.stateManager.update(
      { status: RecoveryAgentStatuses.EVALUATING },
      this.clock,
    );

    const policyFlags = Object.freeze([
      ...new DefaultSafetyPolicy().evaluate(context, plan),
      ...new DefaultRecoveryPolicy().evaluate(context, plan),
      ...new DefaultSleepPolicy().evaluate(plan),
      ...new DefaultStressPolicy().evaluate(plan),
      ...new DefaultFatiguePolicy().evaluate(plan),
      ...new DefaultTrainingLoadPolicy().evaluate(context, plan),
      ...new DefaultWellnessPolicy().evaluate(context, plan),
      ...new DefaultDeloadPolicy().evaluate(context, plan),
    ]);

    const planValidation = validateRecoveryPlan(plan);
    const constraintValidation = validateConstraints(context, plan);
    const policyIssues = policyFlags.map((flag) =>
      Object.freeze({
        code: "policy_violation" as const,
        message: flag,
        path: "policy",
      }),
    );
    const validation = freezeValidation({
      valid:
        planValidation.valid &&
        constraintValidation.valid &&
        policyFlags.length === 0,
      issues: Object.freeze([
        ...planValidation.issues,
        ...constraintValidation.issues,
        ...policyIssues,
      ]),
    });

    const accepted = validation.valid;
    const confidenceScore = accepted
      ? plan.confidence.score
      : Math.max(0.2, plan.confidence.score * 0.5);

    const decision = freezeDecision({
      id: `rdecision:${context.id}`,
      intent: context.intent,
      goal: context.goal,
      strategyId: context.strategy?.id ?? null,
      plan,
      assessment: plan.assessment,
      accepted,
      confidence: Object.freeze({
        score: confidenceScore,
        label: labelFromScore(confidenceScore),
        rationale: accepted
          ? "Plan passed validators and policies."
          : "Plan rejected by validation/policy checks.",
      }),
      reasons: Object.freeze([
        ...plan.rationale.slice(0, 5),
        accepted ? "Accepted." : "Rejected.",
      ]),
      policyFlags,
      metadata: EMPTY_RECOVERY_AGENT_METADATA,
      decidedAt: this.clock(),
    });

    const recommendations = this.recommendationBuilder.build({
      decision,
      plan,
    });
    const recValidation = validateRecommendations(recommendations);
    const mergedValidation = freezeValidation({
      valid: validation.valid && recValidation.valid,
      issues: Object.freeze([
        ...validation.issues,
        ...recValidation.issues,
      ]),
    });

    const explanation = freezeExplanation({
      id: `rexplain:${context.id}`,
      summary: accepted
        ? `Recovery plan proposed for ${context.goal} (${plan.protocolHint}).`
        : `Recovery plan evaluation failed for ${context.goal}.`,
      bullets: Object.freeze([
        `Intent: ${context.intent}`,
        `Strategy: ${context.strategy?.name ?? "none"}`,
        `Recovery score: ${plan.assessment.recoveryScore.score}`,
        `Readiness: ${plan.assessment.readiness.score}`,
        ...policyFlags.map((f) => `Policy: ${f}`),
      ]),
      strategyRationale: context.strategy?.description ?? null,
      policyNotes: policyFlags,
    });

    const completedAt = this.clock();
    const durationMs = this.nowMs() - startMs;
    const statistics = computeAgentStatistics({
      reasoning,
      plannerCount: planning.plannerIds.length,
      recommendations,
      validation: mergedValidation,
      plan,
      durationMs,
    });

    const snapshot = freezeSnapshot({
      id: `rsnap:${context.id}`,
      decision,
      plan,
      assessment: plan.assessment,
      explanation,
      statistics,
      frozenAt: completedAt,
    });

    const conversation = freezeConversation({
      id: `rconv:${context.id}`,
      conversationId: context.conversationId,
      turnCount: context.memoryTurnCount,
      lastUserMessage: input.request.message,
      intent: context.intent,
      summary: context.conversationSummary,
    });

    const success = decision.accepted && mergedValidation.valid;

    this.stateManager.update(
      {
        status: success
          ? RecoveryAgentStatuses.COMPLETED
          : RecoveryAgentStatuses.FAILED,
        decisionId: decision.id,
        errorMessage: success ? null : explanation.summary,
      },
      this.clock,
    );

    return freezeAgentResult({
      id: `rresult:${input.request.id}`,
      request: input.request,
      context,
      conversation,
      reasoning,
      decision,
      recommendations,
      explanation,
      validation: mergedValidation,
      snapshot,
      statistics,
      success,
      message: explanation.summary,
      metadata: EMPTY_RECOVERY_AGENT_METADATA,
      startedAt,
      completedAt,
      frozenAt: completedAt,
    });
  }
}
