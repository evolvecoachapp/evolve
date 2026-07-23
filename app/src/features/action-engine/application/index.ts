import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ActionPlan } from "../models/ActionPlan";
import type { ActionPackage } from "../models/ActionPackage";
import type { ActionSummary } from "../models/ActionSummary";
import type { ActionValidation } from "../models/ActionValidation";
import type { PlanMetrics } from "../utils/planMetrics";
import {
  createActionEngineService,
  type ActionEngineService,
  type BuildActionPlanOptions,
} from "../services/ActionEngineService";

function resolveService(
  service?: ActionEngineService,
): ActionEngineService {
  return service ?? createActionEngineService();
}

/**
 * Public API — transform CoachResponse into an ActionPackage (immutable ActionPlan).
 *
 * Does not expose planners / policies / selectors internals.
 */
export function buildActionPlan(options: {
  readonly response: CoachResponse;
  readonly planId?: string;
  readonly createdAt?: string;
  readonly service?: ActionEngineService;
}): ActionPackage {
  const { service, ...rest } = options;
  return resolveService(service).buildActionPlan(rest);
}

/**
 * Public API — validate an ActionPlan (integrity only, no execution).
 */
export function validateActionPlan(options: {
  readonly plan: ActionPlan;
  readonly service?: ActionEngineService;
}): ActionValidation {
  return resolveService(options.service).validateActionPlan(options.plan);
}

/**
 * Public API — summarize an ActionPlan.
 */
export function summarizeActionPlan(options: {
  readonly plan: ActionPlan;
  readonly service?: ActionEngineService;
}): ActionSummary {
  return resolveService(options.service).summarizeActionPlan(options.plan);
}

/**
 * Public API — estimate execution metrics without running tools.
 */
export function estimateExecution(options: {
  readonly plan: ActionPlan;
  readonly service?: ActionEngineService;
}): PlanMetrics {
  return resolveService(options.service).estimateExecution(options.plan);
}

/**
 * Public API — describe planned actions as brief strings.
 */
export function describeActions(options: {
  readonly plan: ActionPlan;
  readonly service?: ActionEngineService;
}): readonly string[] {
  return resolveService(options.service).describeActions(options.plan);
}

export type { BuildActionPlanOptions };
