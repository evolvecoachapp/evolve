import { mapCoachTimelineData, type CoachTimelineData } from "../mappers";
import { coachTimelineFrameworkService } from "../services/defaultCoachTimelineFrameworkService";
import type {
  CoachTimelineFrameworkService,
  TimelineFilterDto,
} from "../services/CoachTimelineFrameworkService";

export interface SearchTimelineDeps {
  readonly service?: CoachTimelineFrameworkService;
  readonly query: string;
  readonly filter?: TimelineFilterDto;
}

export async function searchTimeline(deps: SearchTimelineDeps): Promise<CoachTimelineData> {
  const service = deps.service ?? coachTimelineFrameworkService;
  const dto = await service.searchTimeline(deps.query, deps.filter);
  return mapCoachTimelineData(dto);
}
