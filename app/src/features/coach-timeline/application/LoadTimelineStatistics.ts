import { mapTimelineStatistics } from "../mappers";
import type { TimelineStatistics } from "../models";
import { coachTimelineFrameworkService } from "../services/defaultCoachTimelineFrameworkService";
import type {
  CoachTimelineFrameworkService,
  TimelinePeriodDto,
} from "../services/CoachTimelineFrameworkService";

export interface LoadTimelineStatisticsDeps {
  readonly service?: CoachTimelineFrameworkService;
  readonly period?: TimelinePeriodDto;
}

export async function loadTimelineStatistics(
  deps: LoadTimelineStatisticsDeps = {},
): Promise<TimelineStatistics> {
  const service = deps.service ?? coachTimelineFrameworkService;
  const dto = await service.getStatistics(deps.period);
  return mapTimelineStatistics(dto);
}
