import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationResult } from "../models/RecommendationResult";
import {
  createRecommendationEngineService,
  type RecommendationEngineService,
  type RecommendationEngineServiceDeps,
} from "../services/RecommendationEngineService";

function resolveService(
  service?: RecommendationEngineService,
  deps?: RecommendationEngineServiceDeps,
): RecommendationEngineService {
  return service ?? createRecommendationEngineService(deps);
}

/**
 * Public API — build immutable coaching recommendations from decisions.
 */
export function buildRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(options.service, options.deps).buildRecommendations(
    options.input,
  );
}

/**
 * Public API — prioritize recommendation package.
 */
export function prioritizeRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(
    options.service,
    options.deps,
  ).prioritizeRecommendations(options.input);
}

/**
 * Public API — package recommendations for downstream consumers.
 */
export function packageRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(options.service, options.deps).packageRecommendations(
    options.input,
  );
}

/**
 * Public API — describe Recommendation Engine capabilities.
 */
export function describeRecommendations(options: {
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
} = {}): RecommendationDescriptor {
  return resolveService(
    options.service,
    options.deps,
  ).describeRecommendations();
}

/**
 * Public API — validate recommendation package integrity.
 */
export function validateRecommendations(options: {
  readonly input: RecommendationInput;
  readonly service?: RecommendationEngineService;
  readonly deps?: RecommendationEngineServiceDeps;
}): RecommendationResult {
  return resolveService(options.service, options.deps).validateRecommendations(
    options.input,
  );
}

export type { RecommendationEngineServiceDeps };
