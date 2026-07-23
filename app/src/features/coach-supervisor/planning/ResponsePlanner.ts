import type { AggregationResult } from "../models/AggregationResult";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";

/**
 * Planning only — describes response composition inputs.
 */
export class ResponsePlanner {
  plan(input: {
    readonly request: CoachSupervisorRequest;
    readonly aggregation: AggregationResult;
  }): {
    readonly requestId: string;
    readonly sectionCount: number;
    readonly agentIds: readonly string[];
  } {
    return Object.freeze({
      requestId: input.request.id,
      sectionCount: input.aggregation.summaries.length,
      agentIds: Object.freeze([...input.aggregation.orderedAgentIds]),
    });
  }
}

export function createResponsePlanner(): ResponsePlanner {
  return new ResponsePlanner();
}
