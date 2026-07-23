import { WellKnownCapabilityIds } from "../../agent-capability/models/CapabilityId";
import { createMockCollaborationPort } from "../contracts/CollaborationPort";
import { createMockRoutingPort } from "../contracts/RoutingPort";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import {
  createCoachSupervisorService,
  type CoachSupervisorService,
} from "../services/CoachSupervisorService";
import { freezeRequest } from "../utils/FreezeSupervisorState";

export const FIXED_TIMESTAMP = "2026-07-24T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createSupervisorRequest(
  overrides: Partial<CoachSupervisorRequest> = {},
): CoachSupervisorRequest {
  return freezeRequest({
    id: overrides.id ?? "request:supervisor:test",
    message: overrides.message ?? "Plan my workout and check recovery",
    intent: overrides.intent ?? "Plan workout with recovery check",
    requiredCapabilityIds: Object.freeze([
      ...(overrides.requiredCapabilityIds ?? [
        WellKnownCapabilityIds.GENERATE_WORKOUT,
        WellKnownCapabilityIds.EVALUATE_RECOVERY,
      ]),
    ]),
    athleteId: overrides.athleteId ?? "athlete:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    sessionId: overrides.sessionId ?? "session:1",
    preferredAgentIds: Object.freeze([...(overrides.preferredAgentIds ?? [])]),
    metadata: overrides.metadata ?? EMPTY_SUPERVISOR_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestSupervisorService(
  overrides: {
    readonly clock?: () => string;
  } = {},
): CoachSupervisorService {
  return createCoachSupervisorService({
    routingPort: createMockRoutingPort(),
    collaborationPort: createMockCollaborationPort(),
    clock: overrides.clock ?? createFixedClock(),
  });
}
