import type { RestConfiguration } from "../models/RestConfiguration";
import type { RestResult } from "../models/RestResult";
import type { RestSession } from "../models/RestSession";
import type { RestSummary } from "../models/RestSummary";
import {
  ActiveRest,
  createRestRuntimeService,
  type RestRuntimeService,
} from "../services/RestRuntimeService";

function resolveService(
  service?: RestRuntimeService,
): RestRuntimeService {
  return service ?? createRestRuntimeService();
}

/**
 * Public API — start a rest runtime from an immutable RestSession.
 */
export function startRest(
  session: RestSession,
  configuration: Partial<RestConfiguration> = {},
  service?: RestRuntimeService,
): ActiveRest {
  return resolveService(service).start(session, configuration);
}

/**
 * Public API — pause a running rest.
 */
export function pauseRest(
  rest: ActiveRest,
  service?: RestRuntimeService,
): RestSummary {
  return resolveService(service).pause(rest);
}

/**
 * Public API — resume a paused rest.
 */
export function resumeRest(
  rest: ActiveRest,
  service?: RestRuntimeService,
): RestSummary {
  return resolveService(service).resume(rest);
}

/**
 * Public API — cancel an active rest.
 */
export function cancelRest(
  rest: ActiveRest,
  service?: RestRuntimeService,
): RestResult {
  return resolveService(service).cancel(rest);
}

/**
 * Public API — complete an active rest.
 */
export function completeRest(
  rest: ActiveRest,
  service?: RestRuntimeService,
): RestResult {
  return resolveService(service).complete(rest);
}

/**
 * Public API — inject elapsed active duration (no platform timer).
 */
export function updateElapsedTime(
  rest: ActiveRest,
  elapsedMs: number,
  service?: RestRuntimeService,
): RestSummary {
  return resolveService(service).updateElapsedTime(rest, elapsedMs);
}

export type { ActiveRest };
