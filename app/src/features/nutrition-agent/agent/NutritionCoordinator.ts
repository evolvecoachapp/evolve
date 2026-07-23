import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import { NutritionPlanBuilder } from "../builders/NutritionPlanBuilder";
import { RecommendationBuilder } from "../builders/RecommendationBuilder";
import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionRequest } from "../models/NutritionRequest";
import { NutritionAgentStatuses } from "../models/NutritionAgentStatus";
import { labelFromScore } from "../models/NutritionConfidence";
import { createDefaultReasoners } from "../reasoning";
import {
  DefaultAdherencePolicy,
  DefaultCaloriePolicy,
  DefaultHydrationPolicy,
  DefaultMacroPolicy,
  DefaultMealPolicy,
  DefaultRecoveryNutritionPolicy,
  DefaultSafetyPolicy,
  DefaultSupplementPolicy,
} from "../policies";
import { validateRecommendations } from "../validators/validateRecommendations";
import { validateNutritionPlan } from "../validators/validateNutritionPlan";
import {
  validateConstraints,
  validatePreferences,
} from "../validators/validateDietAndSafety";
import {
  freezeAgentResult,
  freezeConversation,
  freezeDecision,
  freezeExplanation,
  freezeSnapshot,
  freezeValidation,
} from "../utils/FreezeNutritionState";
import { computeAgentStatistics } from "../utils/statisticsHelpers";
import { NutritionAgentSession } from "./NutritionSession";
import { NutritionAgentStateManager } from "./NutritionState";

export interface NutritionAgentCoordinatorDeps {
  readonly clock?: () => string;
  readonly nowMs?: () => number;
  readonly session?: NutritionAgentSession;
}

/**
 * Coordinates reason → plan → policy → validate → result.
 * No AI. No providers. No tool execution.
 */
export class NutritionAgentCoordinator {
  private readonly clock: () => string;
  private readonly nowMs: () => number;
  private readonly session: NutritionAgentSession;
  private readonly stateManager: NutritionAgentStateManager;
  private readonly contextBuilder = new NutritionContextBuilder();
  private readonly planBuilder = new NutritionPlanBuilder();
  private readonly recommendationBuilder = new RecommendationBuilder();

  constructor(deps: NutritionAgentCoordinatorDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
    this.session =
      deps.session ??
      new NutritionAgentSession("session:nutrition:default", this.clock);
    this.stateManager = new NutritionAgentStateManager(this.session);
  }

  getSession(): NutritionAgentSession {
    return this.session;
  }

  process(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionAgentResult {
    const startedAt = this.clock();
    const startMs = this.nowMs();

    this.stateManager.update(
      {
        status: NutritionAgentStatuses.PREPARING,
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
        status: NutritionAgentStatuses.REASONING,
        contextId: context.id,
      },
      this.clock,
    );

    const reasoning = Object.freeze(
      createDefaultReasoners().map((r) => r.reason(context)),
    );

    this.stateManager.update(
      { status: NutritionAgentStatuses.PLANNING },
      this.clock,
    );

    const planning = this.planBuilder.build({
      context,
      reasoning,
      clock: this.clock,
    });
    const plan = planning.plan;

    this.stateManager.update(
      { status: NutritionAgentStatuses.EVALUATING },
      this.clock,
    );

    const policyFlags = Object.freeze([
      ...new DefaultSafetyPolicy().evaluate(context, plan),
      ...new DefaultCaloriePolicy().evaluate(plan),
      ...new DefaultMacroPolicy().evaluate(plan),
      ...new DefaultMealPolicy().evaluate(plan),
      ...new DefaultHydrationPolicy().evaluate(plan),
      ...new DefaultSupplementPolicy().evaluate(plan),
      ...new DefaultAdherencePolicy().evaluate(context, plan),
      ...new DefaultRecoveryNutritionPolicy().evaluate(context, plan),
    ]);

    const planValidation = validateNutritionPlan(plan);
    const constraintValidation = validateConstraints(context, plan);
    const preferenceValidation = validatePreferences(context, plan);
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
        preferenceValidation.valid &&
        policyFlags.length === 0,
      issues: Object.freeze([
        ...planValidation.issues,
        ...constraintValidation.issues,
        ...preferenceValidation.issues,
        ...policyIssues,
      ]),
    });

    const accepted = validation.valid;
    const confidenceScore = accepted
      ? plan.confidence.score
      : Math.max(0.2, plan.confidence.score * 0.5);

    const decision = freezeDecision({
      id: `ndecision:${context.id}`,
      intent: context.intent,
      goal: context.goal,
      strategyId: context.strategy?.id ?? null,
      plan,
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
      metadata: EMPTY_NUTRITION_AGENT_METADATA,
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
      id: `nexplain:${context.id}`,
      summary: accepted
        ? `Nutrition plan proposed for ${context.goal} (${plan.phaseHint}).`
        : `Nutrition plan evaluation failed for ${context.goal}.`,
      bullets: Object.freeze([
        `Intent: ${context.intent}`,
        `Strategy: ${context.strategy?.name ?? "none"}`,
        `Calories: ${plan.calorieTargets.targetCalories}`,
        `Protein: ${plan.macroTargets.proteinG}g`,
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
      id: `nsnap:${context.id}`,
      decision,
      plan,
      explanation,
      statistics,
      frozenAt: completedAt,
    });

    const conversation = freezeConversation({
      id: `nconv:${context.id}`,
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
          ? NutritionAgentStatuses.COMPLETED
          : NutritionAgentStatuses.FAILED,
        decisionId: decision.id,
        errorMessage: success ? null : explanation.summary,
      },
      this.clock,
    );

    return freezeAgentResult({
      id: `nresult:${input.request.id}`,
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
      metadata: EMPTY_NUTRITION_AGENT_METADATA,
      startedAt,
      completedAt,
      frozenAt: completedAt,
    });
  }
}
