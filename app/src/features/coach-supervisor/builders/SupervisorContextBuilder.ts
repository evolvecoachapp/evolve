import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import { freezeContext, freezeRequest } from "../utils/FreezeSupervisorState";

export function buildSupervisorContext(input: {
  readonly id: string;
  readonly request: CoachSupervisorRequest;
  readonly routingRequestId?: string | null;
  readonly collaborationRequestId?: string | null;
  readonly selectedAgentIds?: readonly string[];
  readonly selectedCapabilityIds?: readonly string[];
  readonly createdAt: string;
}): CoachSupervisorContext {
  return freezeContext({
    id: input.id,
    request: freezeRequest(input.request),
    routingRequestId: input.routingRequestId ?? null,
    collaborationRequestId: input.collaborationRequestId ?? null,
    selectedAgentIds: Object.freeze([...(input.selectedAgentIds ?? [])]),
    selectedCapabilityIds: Object.freeze([
      ...(input.selectedCapabilityIds ?? []),
    ]),
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
