import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  WorkoutAgentEngine,
  type WorkoutAgentEngineDeps,
} from "../agent/WorkoutAgentEngine";
import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutAgentOrchestrator } from "../orchestrator/WorkoutAgentOrchestrator";

/**
 * Workout Agent Service — coordinates engine / orchestrator.
 *
 * No networking. No persistence. No provider SDKs. No prompt generation.
 */
export class WorkoutAgentService {
  private readonly engine: WorkoutAgentEngine;
  private readonly orchestrator: WorkoutAgentOrchestrator;

  constructor(deps: WorkoutAgentEngineDeps = {}) {
    this.engine = new WorkoutAgentEngine(deps);
    this.orchestrator = new WorkoutAgentOrchestrator(deps);
  }

  describeCapabilities(): WorkoutAgent {
    return this.engine.describe();
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
  deps: WorkoutAgentEngineDeps = {},
): WorkoutAgentService {
  return new WorkoutAgentService(deps);
}

export type { WorkoutAgentEngineDeps as WorkoutAgentServiceDeps };
