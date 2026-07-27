import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import {
  createPlanRestoreService,
  type PlanRestoreService,
} from "../../../features/plan-restore/services/PlanRestoreService";

export interface PlanRestoreFactoryDeps {
  readonly planHistory: PlanHistoryService;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly clock?: () => string;
}

export const PlanRestoreFactory = {
  create(deps: PlanRestoreFactoryDeps): PlanRestoreService {
    return createPlanRestoreService({
      planHistory: deps.planHistory,
      coachTimeline: deps.coachTimeline ?? null,
      clock: deps.clock,
    });
  },
} as const;
