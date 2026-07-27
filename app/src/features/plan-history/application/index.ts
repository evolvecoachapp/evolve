import type { PublishPlanVersionRequest } from "../models/PublishPlanVersionRequest";
import type { PlanSnapshot } from "../models/PlanSnapshot";
import type { PlanHistory } from "../models/PlanHistory";
import {
  createPlanHistoryService,
  type PlanHistoryService,
  type PlanHistoryServiceDeps,
} from "../services/PlanHistoryService";

function resolveService(
  service: PlanHistoryService | undefined,
  deps: PlanHistoryServiceDeps | undefined,
): PlanHistoryService {
  if (service) return service;
  return createPlanHistoryService(deps ?? {});
}

/** Public API — publish a brand-new immutable plan version. */
export function publishPlanVersion(options: {
  readonly request: PublishPlanVersionRequest;
  readonly service?: PlanHistoryService;
  readonly deps?: PlanHistoryServiceDeps;
}): PlanSnapshot {
  return resolveService(options.service, options.deps).publishVersion(
    options.request,
  );
}

/** Public API — read immutable plan history for a lineage. */
export function getPlanHistory(options: {
  readonly lineageId: string;
  readonly service?: PlanHistoryService;
  readonly deps?: PlanHistoryServiceDeps;
}): PlanHistory | null {
  return resolveService(options.service, options.deps).getHistory(
    options.lineageId,
  );
}

export type { PlanHistoryServiceDeps };
