import type {
  RoutingPort,
  RoutingResolution,
} from "../../../features/coach-supervisor/contracts/RoutingPort";
import type { CoachSupervisorRequest } from "../../../features/coach-supervisor/models/CoachSupervisorRequest";
import { EMPTY_ROUTING_METADATA } from "../../../features/supervisor-routing/models/RoutingMetadata";
import { RoutingPriorityLevels } from "../../../features/supervisor-routing/models/RoutingPriority";
import type { RoutingRequest } from "../../../features/supervisor-routing/models/RoutingRequest";
import type { SupervisorRoutingService } from "../../../features/supervisor-routing/services/SupervisorRoutingService";

/**
 * Thin adapter: Supervisor Routing Service → Coach Supervisor RoutingPort.
 * Mapping only — no routing logic.
 */
export function createSupervisorRoutingPortAdapter(
  routing: SupervisorRoutingService,
): RoutingPort {
  return Object.freeze({
    resolve(request: CoachSupervisorRequest): RoutingResolution {
      const routingRequest = toRoutingRequest(request);
      const result = routing.buildRoutingPlan(routingRequest);
      const targets = (result.plan?.targets ?? []).map((target, index) =>
        Object.freeze({
          agentId: target.agentId,
          capabilityId: target.capabilityId,
          orderIndex: index,
        }),
      );
      return Object.freeze({
        success: result.success && targets.length > 0,
        routingPlanId: result.plan?.id ?? null,
        routingRequestId: routingRequest.id,
        targets: Object.freeze(targets),
        message: result.message,
      });
    },
  });
}

function toRoutingRequest(request: CoachSupervisorRequest): RoutingRequest {
  return Object.freeze({
    id: `routing:${request.id}`,
    coachAgentId: "agent:coach-supervisor",
    intent: request.intent,
    requiredCapabilities: Object.freeze(
      request.requiredCapabilityIds.map((capabilityId, index) =>
        Object.freeze({
          id: `cap:${request.id}:${index}`,
          capabilityId,
          required: true,
          priority: RoutingPriorityLevels.NORMAL,
          dependsOn: Object.freeze([] as string[]),
          metadata: EMPTY_ROUTING_METADATA,
        }),
      ),
    ),
    dependencies: Object.freeze([] as const),
    constraints: Object.freeze([] as const),
    athleteId: request.athleteId,
    conversationId: request.conversationId,
    sessionId: request.sessionId,
    metadata: EMPTY_ROUTING_METADATA,
    createdAt: request.createdAt,
  });
}
