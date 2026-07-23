import { AgentExecutionStatuses } from "../models/AgentExecutionSummary";
import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";

export function countByStatus(summaries: readonly AgentExecutionSummary[]): {
  readonly successCount: number;
  readonly failureCount: number;
  readonly skippedCount: number;
} {
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;
  for (const s of summaries) {
    if (s.status === AgentExecutionStatuses.SUCCEEDED) successCount += 1;
    else if (s.status === AgentExecutionStatuses.FAILED) failureCount += 1;
    else if (s.status === AgentExecutionStatuses.SKIPPED) skippedCount += 1;
  }
  return Object.freeze({ successCount, failureCount, skippedCount });
}

export function collectProvenance(
  summaries: readonly AgentExecutionSummary[],
): readonly string[] {
  return Object.freeze(
    summaries
      .map((s) => s.provenance ?? s.agentId)
      .filter((v): v is string => v.length > 0),
  );
}
