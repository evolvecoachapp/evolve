import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { appendRecoveryAdjustment } from "../../coach-timeline/builders/timelineIntegration";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import {
  RecoveryAgentFacade,
  RecoveryAgentEngine,
  type RecoveryAgentFacadeDeps,
} from "../agent/RecoveryAgent";
import type { RecoveryAgentEngineDeps } from "../agent/RecoveryAgentEngine";
import type { RecoveryAgent } from "../models/RecoveryAgent";
import type { RecoveryAgentResult } from "../models/RecoveryAgentResult";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryAgentOrchestrator } from "../orchestrator/RecoveryAgentOrchestrator";

export interface RecoveryAgentServiceDeps extends RecoveryAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
  readonly coachTimeline?: CoachTimelineService | null;
}

/**
 * Recovery Agent Service — coordinates engine / orchestrator.
 *
 * Implements Agent Framework IAgent adapter. Processing behavior is
 * orchestration-only. No networking. No persistence. No provider SDKs.
 */
export class RecoveryAgentService {
  private readonly engine: RecoveryAgentEngine;
  private readonly orchestrator: RecoveryAgentOrchestrator;
  private readonly facade: RecoveryAgentFacade;
  private readonly coachTimeline: CoachTimelineService | null;

  constructor(deps: RecoveryAgentServiceDeps = {}) {
    const facadeDeps: RecoveryAgentFacadeDeps = {
      ...deps,
      registerWithFramework: deps.registerWithFramework ?? false,
      frameworkService: deps.frameworkService,
    };
    this.facade = new RecoveryAgentFacade(facadeDeps);
    this.engine = this.facade.getEngine();
    this.orchestrator = new RecoveryAgentOrchestrator(deps);
    this.coachTimeline = deps.coachTimeline ?? null;
  }

  describeCapabilities(): RecoveryAgent {
    return this.engine.describe();
  }

  asFrameworkAgent(): IAgent {
    return this.facade.asFrameworkAgent();
  }

  registerWithFramework(frameworkService: AgentFrameworkService): void {
    frameworkService.registerAgent(this.asFrameworkAgent());
  }

  processRecoveryRequest(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryAgentResult {
    const result = this.orchestrator.orchestrate(input);
    this.journalRecovery(result);
    return result;
  }

  buildRecoveryPlan(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryPlan {
    const plan = this.engine.buildPlan(input);
    if (this.coachTimeline) {
      appendRecoveryAdjustment({
        timeline: this.coachTimeline,
        athleteId: input.request.athleteId ?? "athlete:unknown",
        planId: plan.id,
        summary: `Recovery strategy adjusted (${plan.strategyId ?? plan.id})`,
        explanation: "Recovery Agent built an updated recovery plan",
        conversationId: input.request.conversationId ?? null,
        at: new Date().toISOString(),
      });
    }
    return plan;
  }

  evaluateRecovery(plan: RecoveryPlan): RecoveryValidation {
    return this.engine.evaluate(plan);
  }

  validateRecoveryPlan(plan: RecoveryPlan): RecoveryValidation {
    return this.engine.evaluate(plan);
  }

  private journalRecovery(result: RecoveryAgentResult): void {
    if (!result.success || !this.coachTimeline) return;
    const plan = result.decision.plan;
    if (!plan) return;
    appendRecoveryAdjustment({
      timeline: this.coachTimeline,
      athleteId: result.request.athleteId ?? "athlete:unknown",
      planId: plan.id,
      summary: `Recovery strategy adjusted (${plan.strategyId ?? plan.id})`,
      explanation:
        result.message ??
        result.explanation.summary ??
        "Recovery Agent updated recovery strategy",
      conversationId: result.request.conversationId ?? null,
      at: result.completedAt,
    });
  }
}

export function createRecoveryAgentService(
  deps: RecoveryAgentServiceDeps = {},
): RecoveryAgentService {
  return new RecoveryAgentService(deps);
}
