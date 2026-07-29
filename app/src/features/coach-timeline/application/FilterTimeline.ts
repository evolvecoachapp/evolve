import { mapCoachTimelineData, type CoachTimelineData } from "../mappers";
import { coachTimelineFrameworkService } from "../services/defaultCoachTimelineFrameworkService";
import type {
  CoachTimelineFrameworkService,
  TimelineFilterDto,
} from "../services/CoachTimelineFrameworkService";

export interface FilterTimelineDeps {
  readonly service?: CoachTimelineFrameworkService;
  readonly filter: TimelineFilterDto;
}

export async function filterTimeline(deps: FilterTimelineDeps): Promise<CoachTimelineData> {
  const service = deps.service ?? coachTimelineFrameworkService;
  const dto = await service.filterTimeline(deps.filter);
  return mapCoachTimelineData(dto);
}
