import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import { EMPTY_SUPERVISOR_METADATA } from "./CoachSupervisorMetadata";

/**
 * Immutable structural diagnostics for orchestration.
 */
export interface SupervisorDiagnostics {
  readonly id: string;
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
}

export const EMPTY_SUPERVISOR_DIAGNOSTICS: SupervisorDiagnostics = Object.freeze({
  id: "diag:empty",
  warnings: Object.freeze([] as string[]),
  notes: Object.freeze([] as string[]),
  metadata: EMPTY_SUPERVISOR_METADATA,
  createdAt: "",
});
