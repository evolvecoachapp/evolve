import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { NutritionAgent } from "../models/NutritionAgent";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionRequest } from "../models/NutritionRequest";
import type { NutritionValidation } from "../models/NutritionValidation";
import {
  createNutritionAgentService,
  type NutritionAgentService,
  type NutritionAgentServiceDeps,
} from "../services/NutritionAgentService";

function resolveService(
  service?: NutritionAgentService,
  deps?: NutritionAgentServiceDeps,
): NutritionAgentService {
  return service ?? createNutritionAgentService(deps);
}

/**
 * Public API — process a nutrition request through the Nutrition Agent.
 */
export function processNutritionRequest(options: {
  readonly request: NutritionRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly service?: NutritionAgentService;
  readonly clock?: NutritionAgentServiceDeps["clock"];
  readonly nowMs?: NutritionAgentServiceDeps["nowMs"];
}): NutritionAgentResult {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.processNutritionRequest(rest);
}

/**
 * Public API — build an immutable nutrition plan proposal.
 */
export function buildNutritionPlan(options: {
  readonly request: NutritionRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly service?: NutritionAgentService;
  readonly clock?: NutritionAgentServiceDeps["clock"];
  readonly nowMs?: NutritionAgentServiceDeps["nowMs"];
}): NutritionPlan {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.buildNutritionPlan(rest);
}

/**
 * Public API — evaluate a nutrition plan proposal.
 */
export function evaluateNutrition(options: {
  readonly plan: NutritionPlan;
  readonly service?: NutritionAgentService;
}): NutritionValidation {
  return resolveService(options.service).evaluateNutrition(options.plan);
}

/**
 * Public API — describe Nutrition Agent capabilities.
 */
export function describeNutritionCapabilities(options: {
  readonly service?: NutritionAgentService;
  readonly clock?: NutritionAgentServiceDeps["clock"];
} = {}): NutritionAgent {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.describeCapabilities();
}

/**
 * Public API — validate a nutrition plan proposal.
 */
export function validateNutritionPlan(options: {
  readonly plan: NutritionPlan;
  readonly service?: NutritionAgentService;
}): NutritionValidation {
  return resolveService(options.service).validateNutritionPlan(options.plan);
}

export type { NutritionAgentServiceDeps };
