import {
  createMockCoachSupervisorPort,
  type CoachSupervisorPort,
} from "../contracts/CoachSupervisorPort";
import type { ConversationRuntimePort } from "../contracts/ConversationRuntimePort";
import type { CoachingSession } from "../models/CoachingSession";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionResult } from "../models/SessionResult";
import {
  createCoachingSessionEngine,
  type CoachingSessionEngine,
} from "../session/CoachingSessionEngine";

export interface CoachingSessionServiceDeps {
  readonly supervisorPort?: CoachSupervisorPort;
  readonly conversationPort?: ConversationRuntimePort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

/**
 * Coaching Session Service — session orchestration facade.
 *
 * Conversation Runtime → Coaching Session Runtime → Coach Supervisor →
 * Multi-Agent Platform → Unified Coach Response (via port)
 *
 * No networking. No persistence. No provider SDKs. No prompts. No business logic.
 */
export class CoachingSessionService {
  private readonly engine: CoachingSessionEngine;

  constructor(deps: CoachingSessionServiceDeps = {}) {
    this.engine = createCoachingSessionEngine({
      supervisorPort: deps.supervisorPort ?? createMockCoachSupervisorPort(),
      conversationPort: deps.conversationPort,
      clock: deps.clock,
      runtimeId: deps.runtimeId,
    });
  }

  startSession(request: SessionRequest): SessionResult {
    return this.engine.startSession(request);
  }

  continueSession(request: SessionRequest): SessionResult {
    return this.engine.continueSession(request);
  }

  endSession(request: SessionRequest): SessionResult {
    return this.engine.endSession(request);
  }

  describeSession(): CoachingSession {
    return this.engine.describe();
  }

  validateSession(request: SessionRequest): SessionResult {
    return this.engine.validateSession(request);
  }
}

export function createCoachingSessionService(
  deps: CoachingSessionServiceDeps = {},
): CoachingSessionService {
  return new CoachingSessionService(deps);
}
