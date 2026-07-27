import {
  createPlanHistoryService,
  type PlanHistoryService,
} from "../../../features/plan-history/services/PlanHistoryService";

export interface PlanHistoryFactoryDeps {
  readonly clock?: () => string;
  readonly service?: PlanHistoryService;
}

export const PlanHistoryFactory = {
  create(deps: PlanHistoryFactoryDeps = {}): PlanHistoryService {
    return deps.service ?? createPlanHistoryService({ clock: deps.clock });
  },
} as const;
