import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionResult } from "../models/DecisionResult";
import {
  createDecisionEngineService,
  type DecisionEngineService,
  type DecisionEngineServiceDeps,
} from "../services/DecisionEngineService";

function resolveService(
  service?: DecisionEngineService,
  deps?: DecisionEngineServiceDeps,
): DecisionEngineService {
  return service ?? createDecisionEngineService(deps);
}

/**
 * Public API — build immutable coaching decisions from fused context.
 */
export function buildDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).buildDecision(
    options.input,
  );
}

/**
 * Public API — evaluate decision candidates / package.
 */
export function evaluateDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).evaluateDecision(
    options.input,
  );
}

/**
 * Public API — resolve conflicts into final coaching decisions.
 */
export function resolveDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).resolveDecision(
    options.input,
  );
}

/**
 * Public API — describe Decision Engine capabilities.
 */
export function describeDecision(options: {
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
} = {}): DecisionDescriptor {
  return resolveService(options.service, options.deps).describeDecision();
}

/**
 * Public API — validate decision package integrity.
 */
export function validateDecision(options: {
  readonly input: DecisionInput;
  readonly service?: DecisionEngineService;
  readonly deps?: DecisionEngineServiceDeps;
}): DecisionResult {
  return resolveService(options.service, options.deps).validateDecision(
    options.input,
  );
}

export type { DecisionEngineServiceDeps };
