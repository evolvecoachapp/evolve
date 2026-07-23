import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorResult } from "../models/CoachSupervisorResult";
import { EMPTY_SUPERVISOR_VALIDATION } from "../models/CoachSupervisorValidation";
import { freezeResult } from "../utils/FreezeSupervisorState";

export type SupervisorResultInput = Pick<
  CoachSupervisorResult,
  "id" | "operation" | "success" | "startedAt" | "completedAt"
> &
  Partial<
    Omit<
      CoachSupervisorResult,
      "id" | "operation" | "success" | "startedAt" | "completedAt" | "frozenAt"
    >
  >;

export function buildSupervisorResult(
  partial: SupervisorResultInput,
): CoachSupervisorResult {
  return freezeResult({
    id: partial.id,
    operation: partial.operation,
    success: partial.success,
    message: partial.message ?? null,
    request: partial.request ?? null,
    context: partial.context ?? null,
    plan: partial.plan ?? null,
    execution: partial.execution ?? null,
    aggregation: partial.aggregation ?? null,
    response: partial.response ?? null,
    summary: partial.summary ?? null,
    snapshot: partial.snapshot ?? null,
    validation: partial.validation ?? EMPTY_SUPERVISOR_VALIDATION,
    error: partial.error ?? null,
    events: Object.freeze([...(partial.events ?? [])]),
    metadata: partial.metadata ?? EMPTY_SUPERVISOR_METADATA,
    startedAt: partial.startedAt,
    completedAt: partial.completedAt,
    frozenAt: partial.completedAt,
  });
}
