import { mapCoachTimelineData, type CoachTimelineData } from "../mappers";
import { coachTimelineFrameworkService } from "../services/defaultCoachTimelineFrameworkService";
import type {
  CoachTimelineFrameworkService,
  TimelineCursorDto,
} from "../services/CoachTimelineFrameworkService";

export interface LoadMoreTimelineDeps {
  readonly service?: CoachTimelineFrameworkService;
  readonly cursor: TimelineCursorDto;
}

export async function loadMoreTimeline(deps: LoadMoreTimelineDeps): Promise<CoachTimelineData> {
  const service = deps.service ?? coachTimelineFrameworkService;
  const dto = await service.loadMore(deps.cursor);
  return mapCoachTimelineData(dto);
}
