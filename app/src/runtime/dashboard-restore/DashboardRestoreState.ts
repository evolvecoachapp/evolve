import type { DashboardRestoreResult } from "./DashboardRestoreResult";
import type { DashboardRestoreStatus } from "./DashboardRestoreStatus";
import { DASHBOARD_RESTORE_STATUS } from "./DashboardRestoreStatus";
import type { DashboardRestoreError } from "./DashboardRestoreError";

export interface DashboardRestoreState {
  readonly status: DashboardRestoreStatus;
  readonly result: DashboardRestoreResult | null;
  readonly error: DashboardRestoreError | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export interface CreateDashboardRestoreStateInput {
  readonly status: DashboardRestoreStatus;
  readonly result?: DashboardRestoreResult | null;
  readonly error?: DashboardRestoreError | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
}

export function createDashboardRestoreState(
  input: CreateDashboardRestoreStateInput,
): DashboardRestoreState {
  return Object.freeze({
    status: input.status,
    result: input.result ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  });
}

export function createIdleDashboardRestoreState(): DashboardRestoreState {
  return createDashboardRestoreState({ status: DASHBOARD_RESTORE_STATUS.idle });
}
