import { mapTimelineSnapshot } from "../mappers";
import type { TimelineSnapshot } from "../models";
import { coachTimelineFrameworkService } from "../services/defaultCoachTimelineFrameworkService";
import type {
  CoachTimelineFrameworkService,
  TimelinePeriodDto,
} from "../services/CoachTimelineFrameworkService";

export interface LoadTimelineSnapshotDeps {
  readonly service?: CoachTimelineFrameworkService;
  readonly period?: TimelinePeriodDto;
}

export async function loadTimelineSnapshot(
  deps: LoadTimelineSnapshotDeps = {},
): Promise<TimelineSnapshot> {
  const service = deps.service ?? coachTimelineFrameworkService;
  const dto = await service.getSnapshot(deps.period);
  return mapTimelineSnapshot(dto);
}
