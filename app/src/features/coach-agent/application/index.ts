import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { CoachAgent } from "../models/CoachAgent";
import type { CoachAgentResult } from "../models/CoachAgentResult";
import type { CoachDecision } from "../models/CoachDecision";
import type { CoachEvaluation } from "../models/CoachValidation";
import type { CoachExecutionPlan } from "../models/CoachExecutionPlan";
import type { CoachRequest } from "../models/CoachRequest";
import type { CoachValidation } from "../models/CoachValidation";
import {
  createCoachAgentService,
  type CoachAgentService,
  type CoachAgentServiceDeps,
} from "../services/CoachAgentService";

function resolveService(
  service?: CoachAgentService,
  deps?: CoachAgentServiceDeps,
): CoachAgentService {
  return service ?? createCoachAgentService(deps);
}

/**
 * Public API — process a coaching request through the Coach meta-agent.
 */
export function processCoachRequest(options: {
  readonly request: CoachRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly service?: CoachAgentService;
  readonly clock?: CoachAgentServiceDeps["clock"];
  readonly nowMs?: CoachAgentServiceDeps["nowMs"];
  readonly ports?: CoachAgentServiceDeps["ports"];
}): CoachAgentResult {
  const { service, clock, nowMs, ports, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs || ports ? { clock, nowMs, ports } : undefined,
  );
  return resolved.processCoachRequest(rest);
}

/**
 * Public API — build an immutable coaching execution plan.
 */
export function buildCoachingPlan(options: {
  readonly request: CoachRequest;
  readonly service?: CoachAgentService;
  readonly clock?: CoachAgentServiceDeps["clock"];
  readonly ports?: CoachAgentServiceDeps["ports"];
}): CoachExecutionPlan {
  const resolved = resolveService(
    options.service,
    options.clock || options.ports
      ? { clock: options.clock, ports: options.ports }
      : undefined,
  );
  return resolved.buildCoachingPlan(options.request);
}

/**
 * Public API — evaluate a coaching decision.
 */
export function evaluateCoachDecision(options: {
  readonly decision: CoachDecision;
  readonly requestId?: string | null;
  readonly planId?: string | null;
  readonly service?: CoachAgentService;
  readonly clock?: CoachAgentServiceDeps["clock"];
}): CoachEvaluation {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.evaluateCoachDecision({
    decision: options.decision,
    requestId: options.requestId,
    planId: options.planId,
  });
}

/**
 * Public API — describe Coach Agent capabilities.
 */
export function describeCoachCapabilities(options: {
  readonly service?: CoachAgentService;
  readonly clock?: CoachAgentServiceDeps["clock"];
} = {}): CoachAgent {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.describeCapabilities();
}

/**
 * Public API — validate a coaching execution plan.
 */
export function validateCoachPlan(options: {
  readonly plan: CoachExecutionPlan;
  readonly service?: CoachAgentService;
}): CoachValidation {
  return resolveService(options.service).validateCoachPlan(options.plan);
}

export type { CoachAgentServiceDeps };
