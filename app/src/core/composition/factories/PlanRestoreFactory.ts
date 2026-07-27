import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import {
  createPlanRestoreService,
  type PlanRestoreService,
} from "../../../features/plan-restore/services/PlanRestoreService";

export interface PlanRestoreFactoryDeps {
  readonly planHistory: PlanHistoryService;
  readonly clock?: () => string;
}

export const PlanRestoreFactory = {
  create(deps: PlanRestoreFactoryDeps): PlanRestoreService {
    return createPlanRestoreService({
      planHistory: deps.planHistory,
      clock: deps.clock,
    });
  },
} as const;
