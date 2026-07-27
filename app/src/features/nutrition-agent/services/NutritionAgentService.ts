import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  appendNutritionEvent,
} from "../../coach-timeline/builders/timelineIntegration";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import {
  NutritionAgentFacade,
  NutritionAgentEngine,
  type NutritionAgentFacadeDeps,
} from "../agent/NutritionAgent";
import type { NutritionAgentEngineDeps } from "../agent/NutritionAgentEngine";
import type { NutritionAgent } from "../models/NutritionAgent";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionAdjustMacrosRequest } from "../models/NutritionDomainPayloads";
import type { NutritionDomainPayloads } from "../models/NutritionDomainPayloads";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionRequest } from "../models/NutritionRequest";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionAgentOrchestrator } from "../orchestrator/NutritionAgentOrchestrator";

export interface NutritionAgentServiceDeps extends NutritionAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
  readonly coachTimeline?: CoachTimelineService | null;
}

/**
 * Nutrition Agent Service — coordinates engine / orchestrator.
 *
 * Specialized framework agent: Agent Runtime → NutritionFrameworkAgent →
 * Nutrition Domain Gateway → Capability Selector → Nutrition Domain →
 * NutritionAgentResult.
 * No networking. No persistence. No provider SDKs. No prompt generation.
 */
export class NutritionAgentService {
  private readonly engine: NutritionAgentEngine;
  private readonly orchestrator: NutritionAgentOrchestrator;
  private readonly facade: NutritionAgentFacade;
  private readonly coachTimeline: CoachTimelineService | null;

  constructor(deps: NutritionAgentServiceDeps = {}) {
    const facadeDeps: NutritionAgentFacadeDeps = {
      ...deps,
      registerWithFramework: deps.registerWithFramework ?? false,
      frameworkService: deps.frameworkService,
    };
    this.facade = new NutritionAgentFacade(facadeDeps);
    this.engine = this.facade.getEngine();
    this.orchestrator = new NutritionAgentOrchestrator(deps);
    this.coachTimeline = deps.coachTimeline ?? null;
  }

  describeCapabilities(): NutritionAgent {
    return this.engine.describe();
  }

  asFrameworkAgent(): IAgent {
    return this.facade.asFrameworkAgent();
  }

  registerWithFramework(frameworkService: AgentFrameworkService): void {
    frameworkService.registerAgent(this.asFrameworkAgent());
  }

  processNutritionRequest(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionAgentResult {
    const result = this.orchestrator.orchestrate(input);
    this.journalNutrition(result, CoachTimelineEventCategories.NUTRITION_CREATED);
    return result;
  }

  buildNutritionPlan(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionPlan {
    const plan = this.engine.buildPlan(input);
    if (this.coachTimeline) {
      appendNutritionEvent({
        timeline: this.coachTimeline,
        athleteId: input.request.athleteId ?? "athlete:unknown",
        category: CoachTimelineEventCategories.NUTRITION_CREATED,
        planId: plan.id,
        summary: `Nutrition plan created (${plan.id})`,
        explanation: "Nutrition Agent generated a nutrition plan",
        conversationId: input.request.conversationId ?? null,
        at: new Date().toISOString(),
      });
    }
    return plan;
  }

  async adjustNutritionPlan(input: {
    readonly request: NutritionRequest;
    readonly adjustMacrosRequest: NutritionAdjustMacrosRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: NutritionDomainPayloads;
  }): Promise<NutritionAgentResult> {
    const result = await this.orchestrator.adjust(input);
    this.journalNutrition(
      result,
      CoachTimelineEventCategories.NUTRITION_MODIFIED,
      "diet nutrition macros",
    );
    return result;
  }

  evaluateNutrition(plan: NutritionPlan): NutritionValidation {
    return this.engine.evaluate(plan);
  }

  validateNutritionPlan(plan: NutritionPlan): NutritionValidation {
    return this.engine.evaluate(plan);
  }

  private journalNutrition(
    result: NutritionAgentResult,
    category:
      | typeof CoachTimelineEventCategories.NUTRITION_CREATED
      | typeof CoachTimelineEventCategories.NUTRITION_MODIFIED,
    searchHints?: string,
  ): void {
    if (!result.success || !this.coachTimeline) return;
    const plan = result.decision.plan;
    if (!plan) return;
    appendNutritionEvent({
      timeline: this.coachTimeline,
      athleteId: result.request.athleteId ?? "athlete:unknown",
      category,
      planId: plan.id,
      summary:
        category === CoachTimelineEventCategories.NUTRITION_CREATED
          ? `Nutrition plan created (${plan.id})`
          : `Nutrition plan modified (${plan.id})`,
      explanation:
        result.message ??
        result.explanation?.summary ??
        "Nutrition Agent updated the nutrition plan",
      conversationId: result.request.conversationId ?? null,
      at: result.completedAt,
      searchHints,
    });
  }
}

export function createNutritionAgentService(
  deps: NutritionAgentServiceDeps = {},
): NutritionAgentService {
  return new NutritionAgentService(deps);
}
