import {
  createCoachTimelineService,
  type CoachTimelineService,
} from "../../../features/coach-timeline/services/CoachTimelineService";

export interface CoachTimelineFactoryDeps {
  readonly clock?: () => string;
  readonly service?: CoachTimelineService;
}

export const CoachTimelineFactory = {
  create(deps: CoachTimelineFactoryDeps = {}): CoachTimelineService {
    return deps.service ?? createCoachTimelineService({ clock: deps.clock });
  },
} as const;
