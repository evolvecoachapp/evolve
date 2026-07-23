import { buildAggregationResult } from "../builders/AggregationBuilder";
import type { AggregationContext } from "../models/AggregationContext";
import type { AggregationResult } from "../models/AggregationResult";

export class ResultAggregator {
  aggregate(input: {
    readonly id: string;
    readonly context: AggregationContext;
    readonly explanations?: readonly string[];
    readonly conflicts?: readonly string[];
    readonly createdAt: string;
  }): AggregationResult {
    return buildAggregationResult(input);
  }
}

export function createResultAggregator(): ResultAggregator {
  return new ResultAggregator();
}
