import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationResult } from "../models/ExplanationResult";
import {
  createExplainabilityEngineService,
  type ExplainabilityEngineService,
  type ExplainabilityEngineServiceDeps,
} from "../services/ExplainabilityEngineService";

function resolveService(
  service?: ExplainabilityEngineService,
  deps?: ExplainabilityEngineServiceDeps,
): ExplainabilityEngineService {
  return service ?? createExplainabilityEngineService(deps);
}

/** Public API — build immutable coaching explanations from decisions + recommendations. */
export function buildExplanation(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).buildExplanation(options.input);
}

/** Public API — validate explanation package integrity. */
export function validateExplanation(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).validateExplanation(options.input);
}

/** Public API — describe Explainability Engine capabilities. */
export function describeExplanation(options: {
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
} = {}): ExplanationDescriptor {
  return resolveService(options.service, options.deps).describeExplanation();
}

/** Public API — create explanation snapshot. */
export function createExplanationSnapshot(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).createExplanationSnapshot(options.input);
}

/** Public API — package explanations for downstream consumers. */
export function packageExplanation(options: {
  readonly input: ExplanationInput;
  readonly service?: ExplainabilityEngineService;
  readonly deps?: ExplainabilityEngineServiceDeps;
}): ExplanationResult {
  return resolveService(options.service, options.deps).packageExplanation(options.input);
}

export type { ExplainabilityEngineServiceDeps };
