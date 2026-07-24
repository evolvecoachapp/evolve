import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { AthleteStateResult } from "../models/AthleteStateResult";
import {
  createAthleteStateService,
  type AthleteStateService,
  type AthleteStateServiceDeps,
} from "../services/AthleteStateService";

function resolveService(
  service?: AthleteStateService,
  deps?: AthleteStateServiceDeps,
): AthleteStateService {
  return service ?? createAthleteStateService(deps);
}

/**
 * Public API — build immutable athlete state.
 */
export function buildAthleteState(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).buildAthleteState(
    options.request,
  );
}

/**
 * Public API — update immutable athlete state from contributions.
 */
export function updateAthleteState(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).updateAthleteState(
    options.request,
  );
}

/**
 * Public API — create an athlete state snapshot.
 */
export function createSnapshot(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).createSnapshot(
    options.request,
  );
}

/**
 * Public API — describe Athlete State Engine capabilities.
 */
export function describeAthleteState(options: {
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
} = {}): AthleteStateDescriptor {
  return resolveService(options.service, options.deps).describeAthleteState();
}

/**
 * Public API — validate athlete state.
 */
export function validateAthleteState(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).validateAthleteState(
    options.request,
  );
}

export type { AthleteStateServiceDeps };
