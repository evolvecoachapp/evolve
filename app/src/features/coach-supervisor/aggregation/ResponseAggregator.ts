import { buildUnifiedCoachResponse } from "../builders/UnifiedResponseBuilder";
import type { AggregationResult } from "../models/AggregationResult";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { UnifiedCoachResponse } from "../models/UnifiedCoachResponse";

export class ResponseAggregator {
  aggregate(input: {
    readonly id: string;
    readonly request: CoachSupervisorRequest;
    readonly aggregation: AggregationResult;
    readonly createdAt: string;
  }): UnifiedCoachResponse {
    return buildUnifiedCoachResponse(input);
  }
}

export function createResponseAggregator(): ResponseAggregator {
  return new ResponseAggregator();
}
