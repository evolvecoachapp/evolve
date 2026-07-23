import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import { sortByOrderIndex } from "../utils/sortHelpers";

export function selectAggregationInputs(
  summaries: readonly AgentExecutionSummary[],
): readonly AgentExecutionSummary[] {
  return sortByOrderIndex(summaries);
}

export function createAggregationSelector() {
  return { select: selectAggregationInputs };
}
