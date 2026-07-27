import type { PlanRestoreRequest } from "../models/PlanRestoreRequest";
import type { PlanRestoreResult } from "../models/PlanRestoreResult";
import {
  createPlanRestoreService,
  type PlanRestoreService,
  type PlanRestoreServiceDeps,
} from "../services/PlanRestoreService";

function resolveService(
  service: PlanRestoreService | undefined,
  deps: PlanRestoreServiceDeps | undefined,
): PlanRestoreService {
  if (service) return service;
  if (!deps) {
    throw new Error(
      "PlanRestoreService requires Composition Root wiring or explicit deps",
    );
  }
  return createPlanRestoreService(deps);
}

/** Public API — restore an immutable plan snapshot as a new version. */
export function restorePlan(options: {
  readonly request: PlanRestoreRequest;
  readonly service?: PlanRestoreService;
  readonly deps?: PlanRestoreServiceDeps;
}): PlanRestoreResult {
  return resolveService(options.service, options.deps).restore(options.request);
}

/** Public API — preview restore without publishing. */
export function previewPlanRestore(options: {
  readonly request: PlanRestoreRequest;
  readonly service?: PlanRestoreService;
  readonly deps?: PlanRestoreServiceDeps;
}) {
  return resolveService(options.service, options.deps).previewOnly(
    options.request,
  );
}

export type { PlanRestoreServiceDeps };
