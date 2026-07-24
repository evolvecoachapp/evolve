import type { SessionRequest } from "../models/SessionRequest";

export interface ContextPlan {
  readonly sessionId: string;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly retainHistory: boolean;
}

/**
 * Plans context assembly for a session turn — no AI.
 */
export class ContextPlanner {
  plan(input: {
    readonly request: SessionRequest;
    readonly sessionId: string;
  }): ContextPlan {
    return Object.freeze({
      sessionId: input.sessionId,
      conversationId: input.request.conversationId,
      athleteId: input.request.athleteId,
      retainHistory: true,
    });
  }
}

export function createContextPlanner(): ContextPlanner {
  return new ContextPlanner();
}
