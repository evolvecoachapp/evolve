import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  WorkoutAgentFacade,
  WorkoutAgentEngine,
  type WorkoutAgentFacadeDeps,
} from "../agent/WorkoutAgent";
import type { WorkoutAgentEngineDeps } from "../agent/WorkoutAgentEngine";
import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
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
 * Migrated onto Agent Framework (IAgent adapter). Processing behavior unchanged.
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
