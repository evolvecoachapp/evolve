import type { CoachSupervisorPortResult } from "../contracts/CoachSupervisorPort";

export interface ResponsePlan {
  readonly includeSections: boolean;
  readonly includeAgents: boolean;
  readonly fallbackMessage: string;
}

/**
 * Plans response assembly from supervisor output — no AI.
 */
export class ResponsePlanner {
  plan(supervisor: CoachSupervisorPortResult): ResponsePlan {
    return Object.freeze({
      includeSections: supervisor.sections.length > 0,
      includeAgents: supervisor.agentIds.length > 0,
      fallbackMessage: supervisor.responseMessage ?? "No coach response.",
    });
  }
}

export function createResponsePlanner(): ResponsePlanner {
  return new ResponsePlanner();
}
