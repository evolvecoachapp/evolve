import type { BootstrapResult } from "../bootstrap/BootstrapResult";
import type { DashboardRestoreResult } from "../dashboard-restore/DashboardRestoreResult";
import type { HydrationResult } from "../hydration/HydrationResult";
import type { RuntimeSessionPhase } from "./RuntimeSessionInitialization";

export interface RuntimeSessionResult {
  readonly status: "ready";
  readonly startedAt: string;
  readonly completedAt: string;
  readonly phases: readonly RuntimeSessionPhase[];
  readonly bootstrap: BootstrapResult;
  readonly hydration: HydrationResult;
  readonly dashboardRestore: DashboardRestoreResult;
}

export interface CreateRuntimeSessionResultInput {
  readonly startedAt: string;
  readonly completedAt: string;
  readonly phases: readonly RuntimeSessionPhase[];
  readonly bootstrap: BootstrapResult;
  readonly hydration: HydrationResult;
  readonly dashboardRestore: DashboardRestoreResult;
}

export function createRuntimeSessionResult(
  input: CreateRuntimeSessionResultInput,
): RuntimeSessionResult {
  return Object.freeze({
    status: "ready",
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    phases: Object.freeze([...input.phases]),
    bootstrap: input.bootstrap,
    hydration: input.hydration,
    dashboardRestore: input.dashboardRestore,
  });
}
