import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";

export class ExplanationAggregator {
  aggregate(summaries: readonly AgentExecutionSummary[]): readonly string[] {
    return Object.freeze(
      summaries.map(
        (s) => `${s.agentId}:${s.success ? "ok" : "fail"}:${s.message ?? ""}`,
      ),
    );
  }
}

export function createExplanationAggregator(): ExplanationAggregator {
  return new ExplanationAggregator();
}
