import type { AggregationResult } from "./AggregationResult";
import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { SupervisorConfidence } from "./SupervisorConfidence";
import type { SupervisorDiagnostics } from "./SupervisorDiagnostics";
import type { SupervisorReasoning } from "./SupervisorReasoning";

/**
 * Immutable unified coach response produced by Supervisor aggregation.
 * Structural merge only — never domain calculation.
 */
export interface UnifiedCoachResponse {
  readonly id: string;
  readonly requestId: string;
  readonly message: string;
  readonly sections: readonly string[];
  readonly agentIds: readonly string[];
  readonly capabilityIds: readonly string[];
  readonly aggregation: AggregationResult;
  readonly confidence: SupervisorConfidence;
  readonly reasoning: SupervisorReasoning;
  readonly diagnostics: SupervisorDiagnostics;
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
