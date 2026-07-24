import type { SessionDecision } from "../models/SessionDecision";
import type { SessionRequest } from "../models/SessionRequest";
import { createSessionPlanner } from "./SessionPlanner";

/**
 * Plans continuation of an active session — planning only.
 */
export class ContinuationPlanner {
  private readonly sessionPlanner = createSessionPlanner();

  plan(input: {
    readonly request: SessionRequest;
    readonly decisionId: string;
    readonly createdAt: string;
  }): SessionDecision {
    return this.sessionPlanner.plan(input);
  }
}

export function createContinuationPlanner(): ContinuationPlanner {
  return new ContinuationPlanner();
}
