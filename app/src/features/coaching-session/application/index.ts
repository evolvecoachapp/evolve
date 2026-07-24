import type { CoachingSession } from "../models/CoachingSession";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionResult } from "../models/SessionResult";
import {
  createCoachingSessionService,
  type CoachingSessionService,
  type CoachingSessionServiceDeps,
} from "../services/CoachingSessionService";

function resolveService(
  service?: CoachingSessionService,
  deps?: CoachingSessionServiceDeps,
): CoachingSessionService {
  return service ?? createCoachingSessionService(deps);
}

/**
 * Public API — start a coaching session.
 */
export function startSession(options: {
  readonly request: SessionRequest;
  readonly service?: CoachingSessionService;
  readonly supervisorPort?: CoachingSessionServiceDeps["supervisorPort"];
  readonly conversationPort?: CoachingSessionServiceDeps["conversationPort"];
  readonly clock?: CoachingSessionServiceDeps["clock"];
}): SessionResult {
  const { request, service, supervisorPort, conversationPort, clock } = options;
  return resolveService(
    service,
    supervisorPort || conversationPort || clock
      ? { supervisorPort, conversationPort, clock }
      : undefined,
  ).startSession(request);
}

/**
 * Public API — continue an active coaching session.
 */
export function continueSession(options: {
  readonly request: SessionRequest;
  readonly service?: CoachingSessionService;
  readonly supervisorPort?: CoachingSessionServiceDeps["supervisorPort"];
  readonly conversationPort?: CoachingSessionServiceDeps["conversationPort"];
  readonly clock?: CoachingSessionServiceDeps["clock"];
}): SessionResult {
  const { request, service, supervisorPort, conversationPort, clock } = options;
  return resolveService(
    service,
    supervisorPort || conversationPort || clock
      ? { supervisorPort, conversationPort, clock }
      : undefined,
  ).continueSession(request);
}

/**
 * Public API — end a coaching session.
 */
export function endSession(options: {
  readonly request: SessionRequest;
  readonly service?: CoachingSessionService;
  readonly supervisorPort?: CoachingSessionServiceDeps["supervisorPort"];
  readonly conversationPort?: CoachingSessionServiceDeps["conversationPort"];
  readonly clock?: CoachingSessionServiceDeps["clock"];
}): SessionResult {
  const { request, service, supervisorPort, conversationPort, clock } = options;
  return resolveService(
    service,
    supervisorPort || conversationPort || clock
      ? { supervisorPort, conversationPort, clock }
      : undefined,
  ).endSession(request);
}

/**
 * Public API — describe Coaching Session Runtime capabilities.
 */
export function describeSession(options: {
  readonly service?: CoachingSessionService;
  readonly clock?: CoachingSessionServiceDeps["clock"];
} = {}): CoachingSession {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.describeSession();
}

/**
 * Public API — validate a session request / existing session.
 */
export function validateSession(options: {
  readonly request: SessionRequest;
  readonly service?: CoachingSessionService;
}): SessionResult {
  return resolveService(options.service).validateSession(options.request);
}

export type { CoachingSessionServiceDeps };
