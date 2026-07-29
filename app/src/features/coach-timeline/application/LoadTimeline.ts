import { mapCoachTimelineData, type CoachTimelineData } from "../mappers";
import { coachTimelineFrameworkService } from "../services/defaultCoachTimelineFrameworkService";
import type {
  CoachTimelineFrameworkService,
  TimelineCursorDto,
  TimelineFilterDto,
} from "../services/CoachTimelineFrameworkService";

export interface LoadTimelineDeps {
  readonly service?: CoachTimelineFrameworkService;
  readonly filter?: TimelineFilterDto;
  readonly cursor?: TimelineCursorDto | null;
}

export async function loadTimeline(deps: LoadTimelineDeps = {}): Promise<CoachTimelineData> {
  const service = deps.service ?? coachTimelineFrameworkService;
  const dto = await service.getTimeline(deps.filter, deps.cursor);
  return mapCoachTimelineData(dto);
}
