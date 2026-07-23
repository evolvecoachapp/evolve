import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import { countByStatus } from "../utils/AggregationHelpers";

export class SummaryAggregator {
  aggregate(summaries: readonly AgentExecutionSummary[]): string {
    const counts = countByStatus(summaries);
    return `agents=${summaries.length};success=${counts.successCount};failure=${counts.failureCount}`;
  }
}

export function createSummaryAggregator(): SummaryAggregator {
  return new SummaryAggregator();
}
