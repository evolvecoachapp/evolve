import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { WorkoutContextBuilder } from "../builders/WorkoutContextBuilder";
import { WorkoutPlanBuilder } from "../builders/WorkoutPlanBuilder";
import { WorkoutRecommendationBuilder } from "../builders/WorkoutRecommendationBuilder";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import type { WorkoutAgentGenerateResult } from "../models/WorkoutAgentGenerateResult";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutDomainPayloads } from "../models/WorkoutDomainPayloads";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import { WorkoutAgentStatuses } from "../models/WorkoutAgentStatus";
import {
  labelFromScore,
} from "../models/WorkoutConfidence";
import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import { createDefaultReasoners } from "../reasoning";
import { WorkoutIntents } from "../models/WorkoutIntent";
import {
  DefaultExercisePolicy,
  DefaultProgressionPolicy,
  DefaultRecoveryPolicy,
  DefaultSafetyPolicy,
  DefaultVolumePolicy,
} from "../policies";
import { validateRecommendations } from "../validators/validateRecommendations";
import { validateWorkoutPlan } from "../validators/validateWorkoutPlan";
import {
  freezeAgentResult,
  freezeConversation,
  freezeDecision,
  freezeExplanation,
  freezeSnapshot,
  freezeValidation,
} from "../utils/freezeAgentState";
import { computeAgentStatistics } from "../utils/statisticsHelpers";
import {
  createWorkoutDomainGateway,
  WorkoutDomainGateway,
  type WorkoutDomainGatewayDeps,
} from "../orchestrator/WorkoutDomainGateway";
import { WorkoutAgentSession } from "./WorkoutAgentSession";
import { WorkoutAgentStateManager } from "./WorkoutAgentState";

export interface WorkoutAgentCoordinatorDeps extends WorkoutDomainGatewayDeps {
  readonly clock?: () => string;
  readonly nowMs?: () => number;
  readonly session?: WorkoutAgentSession;
  readonly domainGateway?: WorkoutDomainGateway;
}

/**
 * Coordinates reason → plan → policy → validate → result.
 * No AI. No providers. No tool execution.
 */
export class WorkoutAgentCoordinator {
  private readonly clock: () => string;
  private readonly nowMs: () => number;
  private readonly session: WorkoutAgentSession;
  private readonly stateManager: WorkoutAgentStateManager;
  private readonly domainGateway: WorkoutDomainGateway;
  private readonly contextBuilder = new WorkoutContextBuilder();
  private readonly planBuilder = new WorkoutPlanBuilder();
  private readonly recommendationBuilder = new WorkoutRecommendationBuilder();

  constructor(deps: WorkoutAgentCoordinatorDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
    this.session =
      deps.session ?? new WorkoutAgentSession("session:workout:default", this.clock);
    this.stateManager = new WorkoutAgentStateManager(this.session);
    this.domainGateway =
      deps.domainGateway ??
      createWorkoutDomainGateway({
        ports: deps.ports,
        clock: this.clock,
        capabilitySelector: deps.capabilitySelector,
      });
  }

  getSession(): WorkoutAgentSession {
    return this.session;
  }

  getDomainGateway(): WorkoutDomainGateway {
    return this.domainGateway;
  }

  process(input: {
    readonly request: WorkoutRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): WorkoutAgentResult {
    const startedAt = this.clock();
    const startMs = this.nowMs();

    this.stateManager.update(
      {
        status: WorkoutAgentStatuses.PREPARING,
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
        status: WorkoutAgentStatuses.REASONING,
        contextId: context.id,
      },
      this.clock,
    );

    const reasoning = Object.freeze(
      createDefaultReasoners().map((r) => r.reason(context)),
    );

    this.stateManager.update(
      { status: WorkoutAgentStatuses.PLANNING },
      this.clock,
    );

    const planning = this.planBuilder.build({
      context,
      reasoning,
      clock: this.clock,
    });
    const proposal = planning.proposal;

    this.stateManager.update(
      { status: WorkoutAgentStatuses.EVALUATING },
      this.clock,
    );

    const policyFlags = Object.freeze([
      ...new DefaultSafetyPolicy().evaluate(context, proposal),
      ...new DefaultRecoveryPolicy().evaluate(context, proposal),
      ...new DefaultProgressionPolicy().evaluate(proposal),
      ...new DefaultVolumePolicy().evaluate(proposal),
      ...new DefaultExercisePolicy().evaluate(proposal),
    ]);

    const planValidation = validateWorkoutPlan(proposal);
    const policyIssues = policyFlags.map((flag) =>
      Object.freeze({
        code: "policy_violation" as const,
        message: flag,
        path: "policy",
      }),
    );
    const validation = freezeValidation({
      valid: planValidation.valid && policyFlags.length === 0,
      issues: Object.freeze([...planValidation.issues, ...policyIssues]),
    });

    const accepted = validation.valid;
    const confidenceScore = accepted
      ? proposal.confidence.score
      : Math.max(0.2, proposal.confidence.score * 0.5);

    const decision = freezeDecision({
      id: `decision:${context.id}`,
      intent: context.intent,
      objective: context.objective,
      strategyId: context.strategy?.id ?? null,
      proposal,
      accepted,
      confidence: Object.freeze({
        score: confidenceScore,
        label: labelFromScore(confidenceScore),
        rationale: accepted
          ? "Plan passed validators and policies."
          : "Plan rejected by validation/policy checks.",
      }),
      reasons: Object.freeze([
        ...proposal.rationale.slice(0, 5),
        accepted ? "Accepted." : "Rejected.",
      ]),
      policyFlags,
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      decidedAt: this.clock(),
    });

    const recommendations = this.recommendationBuilder.build({
      decision,
      proposal,
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
      id: `explain:${context.id}`,
      summary: accepted
        ? `Workout plan proposed for ${context.objective} (${proposal.split}).`
        : `Workout plan evaluation failed for ${context.objective}.`,
      bullets: Object.freeze([
        `Intent: ${context.intent}`,
        `Strategy: ${context.strategy?.name ?? "none"}`,
        `Split: ${proposal.split}`,
        `Days/week: ${proposal.daysPerWeek}`,
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
      proposal,
      durationMs,
    });

    const snapshot = freezeSnapshot({
      id: `snap:${context.id}`,
      decision,
      proposal,
      explanation,
      statistics,
      frozenAt: completedAt,
    });

    const conversation = freezeConversation({
      id: `wconv:${context.id}`,
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
          ? WorkoutAgentStatuses.COMPLETED
          : WorkoutAgentStatuses.FAILED,
        decisionId: decision.id,
        errorMessage: success ? null : explanation.summary,
      },
      this.clock,
    );

    return freezeAgentResult({
      id: `wresult:${input.request.id}`,
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
      domainInvocations: this.domainGateway.planInvocations(
        context.intent,
        context.id,
      ),
      success,
      message: explanation.summary,
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      startedAt,
      completedAt,
      frozenAt: completedAt,
    });
  }

  /**
   * Generate path — plans via agent, then invokes Program Generation via domain gateway.
   */
  async generate(input: {
    readonly request: WorkoutRequest;
    readonly generationRequest: WorkoutGenerationRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: WorkoutDomainPayloads;
  }): Promise<WorkoutAgentGenerateResult> {
    const request = Object.freeze({
      ...input.request,
      intentHint: input.request.intentHint ?? WorkoutIntents.PLAN_WORKOUT,
    });

    const context = new WorkoutContextBuilder().build({
      ...input,
      request,
      clock: this.clock,
    });
    const reasoning = createDefaultReasoners().map((r) => r.reason(context));
    const proposal = new WorkoutPlanBuilder().buildProposal({
      context,
      reasoning,
      clock: this.clock,
    });

    const base = this.process({
      ...input,
      request,
    });

    const { result: generation, invocation } =
      await this.domainGateway.invokeGeneration(
        input.generationRequest,
        base.context.id,
      );

    const extra =
      input.domainPayloads != null
        ? await this.domainGateway.invokeSelected(
            base.context.intent,
            base.context.id,
            {
              ...input.domainPayloads,
              generationRequest: input.generationRequest,
              decisionSource: generation,
            },
          )
        : Object.freeze([invocation]);

    const domainInvocations = Object.freeze(
      input.domainPayloads != null
        ? [...extra]
        : [
            ...base.domainInvocations.filter(
              (item) => item.capability !== invocation.capability,
            ),
            invocation,
          ],
    );

    const success =
      base.success &&
      generation.validationIssues.length === 0 &&
      domainInvocations.every((item) => item.status !== "failed");

    const agent = freezeAgentResult({
      ...base,
      domainInvocations,
      success,
      message: success
        ? `Workout generated via Program Generation (${invocation.summary}).`
        : base.message,
      completedAt: this.clock(),
      frozenAt: this.clock(),
    });

    return Object.freeze({
      agent,
      proposal,
      generation,
      success,
      message: agent.message,
    });
  }

  /**
   * Adapt path — plans via agent, then invokes Training Adaptation Engine.
   */
  async adapt(input: {
    readonly request: WorkoutRequest;
    readonly adaptationRequest: TrainingAdaptationRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: WorkoutDomainPayloads;
  }): Promise<WorkoutAgentResult> {
    const base = this.process({
      ...input,
      request: Object.freeze({
        ...input.request,
        intentHint: input.request.intentHint ?? WorkoutIntents.ADAPT_WORKOUT,
      }),
    });

    const { invocation } = await this.domainGateway.invokeAdaptation(
      input.adaptationRequest,
      base.context.id,
    );

    const extra =
      input.domainPayloads != null
        ? await this.domainGateway.invokeSelected(
            base.context.intent,
            base.context.id,
            {
              ...input.domainPayloads,
              adaptationRequest: input.adaptationRequest,
            },
          )
        : Object.freeze([invocation]);

    const domainInvocations = Object.freeze(
      input.domainPayloads != null
        ? [...extra]
        : [
            ...base.domainInvocations.filter(
              (item) => item.capability !== invocation.capability,
            ),
            invocation,
          ],
    );

    const success =
      base.success &&
      domainInvocations.every(
        (item) => item.status !== "failed",
      );

    return freezeAgentResult({
      ...base,
      domainInvocations,
      success,
      message: success
        ? `Workout adapted via Training Adaptation Engine (${invocation.summary}).`
        : base.message,
      completedAt: this.clock(),
      frozenAt: this.clock(),
    });
  }
}
