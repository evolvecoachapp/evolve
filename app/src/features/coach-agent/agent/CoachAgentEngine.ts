import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  CoachCoordinator,
  type CoachCoordinatorDeps,
} from "../coordinator/CoachCoordinator";
import { CoachDecisionEvaluator } from "../evaluators/CoachDecisionEvaluator";
import type { CoachAgent } from "../models/CoachAgent";
import type { CoachAgentResult } from "../models/CoachAgentResult";
import type { CoachDecision } from "../models/CoachDecision";
import type { CoachEvaluation } from "../models/CoachValidation";
import type { CoachExecutionPlan } from "../models/CoachExecutionPlan";
import type { CoachRequest } from "../models/CoachRequest";
import type { CoachValidation } from "../models/CoachValidation";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import {
  ALL_SPECIALIST_AGENT_KINDS,
  IMPLEMENTED_SPECIALIST_AGENTS,
} from "../models/SpecialistAgentKind";
import { freezeAgent, freezeRequest } from "../utils/FreezeCoachState";
import { validateExecutionPlan } from "../validators/validateExecutionPlan";

export interface CoachAgentEngineDeps extends CoachCoordinatorDeps {
  readonly agentId?: string;
}

/**
 * Top-level Coach Agent engine — meta-agent orchestration only.
 */
export class CoachAgentEngine {
  readonly id: string;
  private readonly coordinator: CoachCoordinator;
  private readonly evaluator: CoachDecisionEvaluator;
  private readonly clock: () => string;

  constructor(deps: CoachAgentEngineDeps = {}) {
    this.id = deps.agentId ?? "agent:coach:default";
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.coordinator = new CoachCoordinator(deps);
    this.evaluator = new CoachDecisionEvaluator();
  }

  describe(): CoachAgent {
    return freezeAgent({
      id: this.id,
      name: "Coach Agent",
      version: "1.0.0",
      capabilities: Object.freeze([
        "meta_orchestration",
        "agent_selection",
        "multi_agent_execution",
        "result_merging",
        "conflict_detection",
        "coaching_plan",
        "decision_evaluation",
      ]),
      supportedAgents: Object.freeze([...IMPLEMENTED_SPECIALIST_AGENTS]),
      futureAgents: Object.freeze(
        ALL_SPECIALIST_AGENT_KINDS.filter(
          (kind) =>
            !(IMPLEMENTED_SPECIALIST_AGENTS as readonly string[]).includes(kind),
        ),
      ),
      metadata: EMPTY_COACH_METADATA,
      createdAt: this.clock(),
    });
  }

  processRequest(input: {
    readonly request: CoachRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): CoachAgentResult {
    return this.coordinator.process({
      ...input,
      request: freezeRequest(input.request),
    });
  }

  buildPlan(request: CoachRequest): CoachExecutionPlan {
    return this.coordinator.buildPlan(freezeRequest(request));
  }

  evaluateDecision(input: {
    readonly decision: CoachDecision;
    readonly requestId?: string | null;
    readonly planId?: string | null;
  }): CoachEvaluation {
    return this.evaluator.evaluate({
      id: `ceval:${input.decision.id}`,
      decision: input.decision,
      requestId: input.requestId,
      planId: input.planId,
      agentsEvaluated: input.decision.prioritizedAgents,
      evaluatedAt: this.clock(),
    });
  }

  validatePlan(plan: CoachExecutionPlan): CoachValidation {
    return validateExecutionPlan(plan);
  }

  getCoordinator(): CoachCoordinator {
    return this.coordinator;
  }
}
