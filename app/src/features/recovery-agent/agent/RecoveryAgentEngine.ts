import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { RecoveryAgent } from "../models/RecoveryAgent";
import { EMPTY_RECOVERY_AGENT_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryAgentResult } from "../models/RecoveryAgentResult";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryPlanBuilder } from "../builders/RecoveryPlanBuilder";
import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { createDefaultReasoners } from "../reasoning";
import { createDefaultPlanners } from "../planning";
import { createDefaultStrategies } from "../strategies";
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
import { validateRecoveryPlan as validatePlan } from "../validators/validateRecoveryPlan";
import { freezeAgent, freezeRequest } from "../utils/FreezeRecoveryState";
import { formatCapabilities } from "../utils/FormattingHelpers";
import {
  RecoveryAgentCoordinator,
  type RecoveryAgentCoordinatorDeps,
} from "./RecoveryCoordinator";

export interface RecoveryAgentEngineDeps extends RecoveryAgentCoordinatorDeps {
  readonly agentId?: string;
}

/**
 * Top-level Recovery Agent engine — orchestration only.
 */
export class RecoveryAgentEngine {
  readonly id: string;
  private readonly coordinator: RecoveryAgentCoordinator;
  private readonly clock: () => string;

  constructor(deps: RecoveryAgentEngineDeps = {}) {
    this.id = deps.agentId ?? "agent:recovery:default";
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.coordinator = new RecoveryAgentCoordinator(deps);
  }

  describe(): RecoveryAgent {
    return freezeAgent({
      id: this.id,
      name: "Recovery Agent",
      version: "1.0.0",
      capabilities: formatCapabilities([
        "recovery_assessment",
        "recovery_planning",
        "fatigue_analysis",
        "readiness_analysis",
        "sleep_guidance",
        "stress_guidance",
        "deload_guidance",
        "recovery_education",
        "plan_evaluation",
      ]),
      strategyIds: Object.freeze(
        createDefaultStrategies().map((s) => s.id),
      ),
      policyIds: Object.freeze([
        new DefaultSafetyPolicy().id,
        new DefaultRecoveryPolicy().id,
        new DefaultSleepPolicy().id,
        new DefaultStressPolicy().id,
        new DefaultFatiguePolicy().id,
        new DefaultTrainingLoadPolicy().id,
        new DefaultWellnessPolicy().id,
        new DefaultDeloadPolicy().id,
      ]),
      reasonerIds: Object.freeze(
        createDefaultReasoners().map((r) => r.id),
      ),
      plannerIds: Object.freeze(createDefaultPlanners().map((p) => p.id)),
      metadata: EMPTY_RECOVERY_AGENT_METADATA,
      createdAt: this.clock(),
    });
  }

  processRequest(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryAgentResult {
    return this.coordinator.process({
      ...input,
      request: freezeRequest(input.request),
    });
  }

  buildPlan(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryPlan {
    const context = new RecoveryContextBuilder().build({
      ...input,
      request: freezeRequest(input.request),
      clock: this.clock,
    });
    const reasoning = createDefaultReasoners().map((r) => r.reason(context));
    return new RecoveryPlanBuilder().buildProposal({
      context,
      reasoning,
      clock: this.clock,
    });
  }

  evaluate(plan: RecoveryPlan): RecoveryValidation {
    return validatePlan(plan);
  }
}
