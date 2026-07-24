import type { SessionHistory } from "../models/SessionHistory";
import type { SessionStatistics } from "../models/SessionStatistics";
import { freezeStatistics } from "./FreezeSessionState";

export function computeSessionStatistics(input: {
  readonly history: SessionHistory;
  readonly checkpointCount: number;
  readonly agentInvocationCount: number;
  readonly successCount: number;
  readonly failureCount: number;
}): SessionStatistics {
  return freezeStatistics({
    turnCount: input.history.entries.length,
    eventCount: input.history.events.length,
    checkpointCount: input.checkpointCount,
    agentInvocationCount: input.agentInvocationCount,
    successCount: input.successCount,
    failureCount: input.failureCount,
  });
}
