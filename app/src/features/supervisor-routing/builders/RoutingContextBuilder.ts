import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import type { RoutingContext } from "../models/RoutingContext";
import type { RoutingMetadata } from "../models/RoutingMetadata";
import type { RoutingRequest } from "../models/RoutingRequest";
import { freezeContext } from "../utils/FreezeRoutingState";
import { sortIdsDeterministic } from "../utils/sortHelpers";

export interface RoutingContextBuilderInput {
  readonly id: string;
  readonly request: RoutingRequest;
  readonly registryId?: string | null;
  readonly capabilityIds: readonly string[];
  readonly candidateAgentIds: readonly string[];
  readonly metadata?: RoutingMetadata;
  readonly createdAt: string;
  readonly frozenAt?: string;
}

export class RoutingContextBuilder {
  build(input: RoutingContextBuilderInput): RoutingContext {
    return freezeContext({
      id: input.id,
      request: input.request,
      registryId: input.registryId ?? null,
      capabilityIds: sortIdsDeterministic(input.capabilityIds),
      candidateAgentIds: sortIdsDeterministic(input.candidateAgentIds),
      metadata: input.metadata ?? EMPTY_ROUTING_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.frozenAt ?? input.createdAt,
    });
  }
}

export function buildRoutingContext(
  input: RoutingContextBuilderInput,
): RoutingContext {
  return new RoutingContextBuilder().build(input);
}
