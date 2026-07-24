import {
  CoachingSessionCapabilityKinds,
  type CoachingSession,
} from "../models/CoachingSession";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import { SessionPhases } from "../models/SessionPhase";
import { SessionStatuses } from "../models/SessionState";
import { freezeDescriptor } from "../utils/FreezeSessionState";

export function buildCoachingSessionDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): CoachingSession {
  return freezeDescriptor({
    id: input.id,
    name: "Coaching Session Runtime",
    version: "1.0.0",
    status: SessionStatuses.IDLE,
    phase: SessionPhases.IDLE,
    capabilities: Object.freeze([
      CoachingSessionCapabilityKinds.START,
      CoachingSessionCapabilityKinds.CONTINUE,
      CoachingSessionCapabilityKinds.END,
      CoachingSessionCapabilityKinds.DESCRIBE,
      CoachingSessionCapabilityKinds.VALIDATE,
    ]),
    metadata: EMPTY_SESSION_METADATA,
    createdAt: input.createdAt,
  });
}
