import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { AgentRuntimeExecutor } from "../../agent-runtime/models/AgentRuntimeExecutor";
import type { AgentRuntimeService } from "../../agent-runtime/services/AgentRuntimeService";
import { AgentRuntimeStatuses } from "../../agent-runtime/models/AgentRuntimeStatus";
import { createRuntimeError } from "../../agent-runtime/models/AgentRuntimeError";
import { freezeResult } from "../../agent-runtime/utils/FreezeRuntime";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import {
  WorkoutAgentFacade,
  WorkoutAgentEngine,
  type WorkoutAgentFacadeDeps,
} from "../agent/WorkoutAgent";
import type { WorkoutAgentEngineDeps } from "../agent/WorkoutAgentEngine";
import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutAgentGenerateResult } from "../models/WorkoutAgentGenerateResult";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutDomainPayloads } from "../models/WorkoutDomainPayloads";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutAgentOrchestrator } from "../orchestrator/WorkoutAgentOrchestrator";

export interface WorkoutAgentServiceDeps extends WorkoutAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Workout Agent Service — coordinates engine / orchestrator.
 *
 * Specialized framework agent: Agent Runtime → WorkoutFrameworkAgent →
 * Planning → Workout Domain → WorkoutAgentResult.
 * No networking. No persistence. No provider SDKs. No prompt generation.
 */
export class WorkoutAgentService {
  private readonly engine: WorkoutAgentEngine;
  private readonly orchestrator: WorkoutAgentOrchestrator;
  private readonly facade: WorkoutAgentFacade;

  constructor(deps: WorkoutAgentServiceDeps = {}) {
    const facadeDeps: WorkoutAgentFacadeDeps = {
      ...deps,
      registerWithFramework: deps.registerWithFramework ?? false,
      frameworkService: deps.frameworkService,
    };
    this.facade = new WorkoutAgentFacade(facadeDeps);
    this.engine = this.facade.getEngine();
    this.orchestrator = new WorkoutAgentOrchestrator(deps);
  }

  describeCapabilities(): WorkoutAgent {
    return this.engine.describe();
  }

  /**
   * Agent Framework IAgent surface for registry / factory resolution.
   */
  asFrameworkAgent(): IAgent {
    return this.facade.asFrameworkAgent();
  }

  /**
   * Register this Workout Agent with an Agent Framework service.
   */
  registerWithFramework(frameworkService: AgentFrameworkService): void {
    frameworkService.registerAgent(this.asFrameworkAgent());
  }

  /**
   * Register this Workout Agent with Agent Runtime (+ domain executor).
   */
  registerWithRuntime(runtimeService: AgentRuntimeService): void {
    runtimeService.registerAgent(this.asFrameworkAgent(), {
      executor: this.createRuntimeExecutor(),
    });
  }

  /**
   * Runtime executor — orchestration shell that processes workout requests
   * carried in runtime request attributes (no business logic).
   */
  createRuntimeExecutor(): AgentRuntimeExecutor {
    return (input) => {
      const requestAttr = input.request.attributes["workoutRequestId"];
      const message =
        typeof input.request.attributes["message"] === "string"
          ? input.request.attributes["message"]
          : input.request.intent ?? "Workout agent execution";

      const workoutRequest: WorkoutRequest = Object.freeze({
        id:
          typeof requestAttr === "string"
            ? requestAttr
            : `wreq:${input.request.id}`,
        athleteId:
          typeof input.request.attributes["athleteId"] === "string"
            ? input.request.attributes["athleteId"]
            : null,
        conversationId: input.request.conversationId,
        message,
        intentHint: null,
        objectiveHint: null,
        daysPerWeek: null,
        experienceLevel: null,
        constraints: Object.freeze([] as string[]),
        metadata: EMPTY_WORKOUT_AGENT_METADATA,
        createdAt: input.request.createdAt,
      });

      const result = this.processWorkoutRequest({ request: workoutRequest });
      const completedAt = input.clock();
      return freezeResult({
        id: `result:${input.plan.id}`,
        planId: input.plan.id,
        requestId: input.request.id,
        agentId: input.agent.id,
        success: result.success,
        status: result.success
          ? AgentRuntimeStatuses.COMPLETED
          : AgentRuntimeStatuses.FAILED,
        message: result.message ?? "Workout agent completed",
        attributes: Object.freeze({
          workoutResultId: result.id,
          domainInvocationCount: String(result.domainInvocations.length),
        }),
        error: result.success
          ? null
          : createRuntimeError({
              code: "workout_agent_failed",
              message: result.message ?? "Workout agent failed",
              agentId: input.agent.id,
              occurredAt: completedAt,
            }),
        metadata: {
          tags: Object.freeze(["workout-agent", "domain-orchestration"]),
          attributes: Object.freeze({
            strategyId: result.decision.strategyId ?? "",
          }),
        },
        startedAt: input.startedAt,
        completedAt,
        durationMs: Math.max(0, input.nowMs() - input.nowMs()),
        frozenAt: completedAt,
      });
    };
  }

  processWorkoutRequest(input: {
    readonly request: WorkoutRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): WorkoutAgentResult {
    return this.orchestrator.orchestrate(input);
  }

  buildWorkoutPlan(input: {
    readonly request: WorkoutRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): WorkoutPlanProposal {
    return this.engine.buildPlan(input);
  }

  async adaptWorkout(input: {
    readonly request: WorkoutRequest;
    readonly adaptationRequest: TrainingAdaptationRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: WorkoutDomainPayloads;
  }): Promise<WorkoutAgentResult> {
    return this.orchestrator.adapt(input);
  }

  async generateWorkout(input: {
    readonly request: WorkoutRequest;
    readonly generationRequest: WorkoutGenerationRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: WorkoutDomainPayloads;
  }): Promise<WorkoutAgentGenerateResult> {
    return this.orchestrator.generate(input);
  }

  evaluateWorkout(proposal: WorkoutPlanProposal): WorkoutValidation {
    return this.engine.evaluate(proposal);
  }

  validateWorkoutPlan(proposal: WorkoutPlanProposal): WorkoutValidation {
    return this.engine.evaluate(proposal);
  }
}

export function createWorkoutAgentService(
  deps: WorkoutAgentServiceDeps = {},
): WorkoutAgentService {
  return new WorkoutAgentService(deps);
}
