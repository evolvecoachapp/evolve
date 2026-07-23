import type { AgentExecutionSummary } from "./AgentExecutionSummary";
import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { SupervisorDiagnostics } from "./SupervisorDiagnostics";

/**
 * Immutable aggregation output (no AI / business logic).
 */
export interface AggregationResult {
  readonly id: string;
  readonly contextId: string;
  readonly planId: string;
  readonly success: boolean;
  readonly message: string;
  readonly summaries: readonly AgentExecutionSummary[];
  readonly orderedAgentIds: readonly string[];
  readonly provenance: readonly string[];
  readonly explanations: readonly string[];
  readonly conflicts: readonly string[];
  readonly diagnostics: SupervisorDiagnostics;
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
