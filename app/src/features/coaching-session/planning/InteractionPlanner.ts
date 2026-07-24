import { SessionActionKinds, type SessionAction } from "../models/SessionAction";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionRequest } from "../models/SessionRequest";
import { freezeAction } from "../utils/FreezeSessionState";

/**
 * Plans the interaction action for a turn — no AI.
 */
export class InteractionPlanner {
  plan(input: {
    readonly actionId: string;
    readonly sessionId: string;
    readonly request: SessionRequest;
    readonly createdAt: string;
  }): SessionAction {
    return freezeAction({
      id: input.actionId,
      kind: SessionActionKinds.SUPERVISE,
      sessionId: input.sessionId,
      requestId: input.request.id,
      label: "Invoke Coach Supervisor for interaction turn",
      metadata: EMPTY_SESSION_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function createInteractionPlanner(): InteractionPlanner {
  return new InteractionPlanner();
}
