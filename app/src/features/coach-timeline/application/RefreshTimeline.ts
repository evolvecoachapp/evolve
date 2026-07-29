import { mapCoachTimelineData, type CoachTimelineData } from "../mappers";
import { coachTimelineFrameworkService } from "../services/defaultCoachTimelineFrameworkService";
import type {
  CoachTimelineFrameworkService,
  TimelineFilterDto,
} from "../services/CoachTimelineFrameworkService";

export interface RefreshTimelineDeps {
  readonly service?: CoachTimelineFrameworkService;
  readonly filter?: TimelineFilterDto;
}

export async function refreshTimeline(deps: RefreshTimelineDeps = {}): Promise<CoachTimelineData> {
  const service = deps.service ?? coachTimelineFrameworkService;
  const dto = await service.getTimeline(deps.filter);
  return mapCoachTimelineData(dto);
}
