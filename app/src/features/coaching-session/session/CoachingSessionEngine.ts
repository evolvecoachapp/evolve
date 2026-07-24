import type { CoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import type { ConversationRuntimePort } from "../contracts/ConversationRuntimePort";
import type { CoachingSession } from "../models/CoachingSession";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionResult } from "../models/SessionResult";
import { buildCoachingSessionDescriptor } from "../builders/SessionBuilder";
import {
  createSessionCoordinator,
  type SessionCoordinator,
} from "./SessionCoordinator";

export interface CoachingSessionEngineDeps {
  readonly supervisorPort: CoachSupervisorPort;
  readonly conversationPort?: ConversationRuntimePort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

/**
 * Coaching Session Engine — session orchestration only.
 */
export class CoachingSessionEngine {
  private readonly coordinator: SessionCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: CoachingSessionEngineDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:coaching-session";
    this.coordinator = createSessionCoordinator({
      supervisorPort: deps.supervisorPort,
      conversationPort: deps.conversationPort,
      clock: this.clock,
    });
  }

  describe(): CoachingSession {
    return buildCoachingSessionDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  startSession(request: SessionRequest): SessionResult {
    return this.coordinator.startSession(request);
  }

  continueSession(request: SessionRequest): SessionResult {
    return this.coordinator.continueSession(request);
  }

  endSession(request: SessionRequest): SessionResult {
    return this.coordinator.endSession(request);
  }

  describeSession(): SessionResult {
    return this.coordinator.describe();
  }

  validateSession(request: SessionRequest): SessionResult {
    return this.coordinator.validate(request);
  }

  getCoordinator(): SessionCoordinator {
    return this.coordinator;
  }
}

export function createCoachingSessionEngine(
  deps: CoachingSessionEngineDeps,
): CoachingSessionEngine {
  return new CoachingSessionEngine(deps);
}
