import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";

/**
 * Thin routing resolution used by Coach Supervisor (no execution).
 */
export interface RoutingResolutionTarget {
  readonly agentId: string;
  readonly capabilityId: string;
  readonly orderIndex: number;
}

export interface RoutingResolution {
  readonly success: boolean;
  readonly routingPlanId: string | null;
  readonly routingRequestId: string | null;
  readonly targets: readonly RoutingResolutionTarget[];
  readonly message: string | null;
}

export interface RoutingPort {
  resolve(request: CoachSupervisorRequest): RoutingResolution;
}

/**
 * Deterministic mock routing — maps capability ids to well-known agents.
 */
export class MockRoutingPort implements RoutingPort {
  resolve(request: CoachSupervisorRequest): RoutingResolution {
    const targets = request.requiredCapabilityIds.map((capabilityId, index) =>
      Object.freeze({
        agentId: inferAgentId(capabilityId, index),
        capabilityId,
        orderIndex: index,
      }),
    );
    return Object.freeze({
      success: targets.length > 0,
      routingPlanId: targets.length > 0 ? `rplan:${request.id}` : null,
      routingRequestId: `rreq:${request.id}`,
      targets: Object.freeze(targets),
      message: targets.length > 0 ? "Routing resolved." : "No capabilities requested.",
    });
  }
}

function inferAgentId(capabilityId: string, index: number): string {
  const lower = capabilityId.toLowerCase();
  if (lower.includes("workout") || lower.includes("generate")) return "agent:workout";
  if (lower.includes("nutrition") || lower.includes("analyze_nutrition"))
    return "agent:nutrition";
  if (lower.includes("recovery") || lower.includes("evaluate")) return "agent:recovery";
  if (lower.includes("goal")) return "agent:goal";
  return `agent:specialist:${index}`;
}

export function createMockRoutingPort(): MockRoutingPort {
  return new MockRoutingPort();
}
