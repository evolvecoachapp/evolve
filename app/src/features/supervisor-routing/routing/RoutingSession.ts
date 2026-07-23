import type { RoutingContext } from "../models/RoutingContext";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingRequest } from "../models/RoutingRequest";
import { RoutingStates, type RoutingState } from "../models/RoutingState";

/**
 * In-memory routing session (orchestration bookkeeping only).
 */
export interface RoutingSession {
  readonly id: string;
  readonly request: RoutingRequest | null;
  readonly context: RoutingContext | null;
  readonly plan: RoutingPlan | null;
  readonly state: RoutingState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createRoutingSession(input: {
  readonly id: string;
  readonly createdAt: string;
}): RoutingSession {
  return Object.freeze({
    id: input.id,
    request: null,
    context: null,
    plan: null,
    state: RoutingStates.IDLE,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  });
}

export function updateRoutingSession(
  session: RoutingSession,
  patch: Partial<
    Omit<RoutingSession, "id" | "createdAt">
  > & { readonly updatedAt: string },
): RoutingSession {
  return Object.freeze({
    ...session,
    ...patch,
  });
}
