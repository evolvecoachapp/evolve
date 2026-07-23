import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { SupervisorDiagnostics } from "../models/SupervisorDiagnostics";
import { freezeDiagnostics } from "../utils/FreezeSupervisorState";

export class DiagnosticsAggregator {
  aggregate(input: {
    readonly id: string;
    readonly summaries: readonly AgentExecutionSummary[];
    readonly warnings?: readonly string[];
    readonly createdAt: string;
  }): SupervisorDiagnostics {
    return freezeDiagnostics({
      id: input.id,
      warnings: Object.freeze([...(input.warnings ?? [])]),
      notes: Object.freeze(
        input.summaries.map((s) => `${s.agentId}:${s.status}`),
      ),
      metadata: EMPTY_SUPERVISOR_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function createDiagnosticsAggregator(): DiagnosticsAggregator {
  return new DiagnosticsAggregator();
}
