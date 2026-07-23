import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { NutritionAgent } from "../models/NutritionAgent";
import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionAdjustMacrosRequest } from "../models/NutritionDomainPayloads";
import type { NutritionDomainPayloads } from "../models/NutritionDomainPayloads";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionRequest } from "../models/NutritionRequest";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionPlanBuilder } from "../builders/NutritionPlanBuilder";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import { createDefaultReasoners } from "../reasoning";
import { createDefaultPlanners } from "../planning";
import { createDefaultStrategies } from "../strategies";
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
import { validateNutritionPlan as validatePlan } from "../validators/validateNutritionPlan";
import { freezeAgent, freezeRequest } from "../utils/FreezeNutritionState";
import { formatCapabilities } from "../utils/FormattingHelpers";
import {
  NutritionAgentCoordinator,
  type NutritionAgentCoordinatorDeps,
} from "./NutritionCoordinator";

export interface NutritionAgentEngineDeps extends NutritionAgentCoordinatorDeps {
  readonly agentId?: string;
}

/**
 * Top-level Nutrition Agent engine — orchestration only.
 */
export class NutritionAgentEngine {
  readonly id: string;
  private readonly coordinator: NutritionAgentCoordinator;
  private readonly clock: () => string;

  constructor(deps: NutritionAgentEngineDeps = {}) {
    this.id = deps.agentId ?? "agent:nutrition:default";
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.coordinator = new NutritionAgentCoordinator(deps);
  }

  describe(): NutritionAgent {
    return freezeAgent({
      id: this.id,
      name: "Nutrition Agent",
      version: "1.1.0",
      capabilities: formatCapabilities([
        "nutrition_planning",
        "macro_distribution",
        "meal_planning",
        "hydration_guidance",
        "supplement_guidance",
        "body_composition_support",
        "nutrition_education",
        "plan_evaluation",
        "domain_orchestration",
      ]),
      strategyIds: Object.freeze(
        createDefaultStrategies().map((s) => s.id),
      ),
      policyIds: Object.freeze([
        new DefaultSafetyPolicy().id,
        new DefaultCaloriePolicy().id,
        new DefaultMacroPolicy().id,
        new DefaultMealPolicy().id,
        new DefaultHydrationPolicy().id,
        new DefaultSupplementPolicy().id,
        new DefaultAdherencePolicy().id,
        new DefaultRecoveryNutritionPolicy().id,
      ]),
      reasonerIds: Object.freeze(
        createDefaultReasoners().map((r) => r.id),
      ),
      plannerIds: Object.freeze(createDefaultPlanners().map((p) => p.id)),
      metadata: EMPTY_NUTRITION_AGENT_METADATA,
      createdAt: this.clock(),
    });
  }

  processRequest(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionAgentResult {
    return this.coordinator.process({
      ...input,
      request: freezeRequest(input.request),
    });
  }

  buildPlan(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionPlan {
    const context = new NutritionContextBuilder().build({
      ...input,
      request: freezeRequest(input.request),
      clock: this.clock,
    });
    const reasoning = createDefaultReasoners().map((r) => r.reason(context));
    return new NutritionPlanBuilder().buildProposal({
      context,
      reasoning,
      clock: this.clock,
    });
  }

  evaluate(plan: NutritionPlan): NutritionValidation {
    return validatePlan(plan);
  }

  adjustNutritionPlan(input: {
    readonly request: NutritionRequest;
    readonly adjustMacrosRequest: NutritionAdjustMacrosRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: NutritionDomainPayloads;
  }): Promise<NutritionAgentResult> {
    return this.coordinator.adjust({
      ...input,
      request: freezeRequest(input.request),
    });
  }

  getCoordinator(): NutritionAgentCoordinator {
    return this.coordinator;
  }
}
