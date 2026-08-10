import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { ProgressAnalyticsError } from "../../progress-analytics/services/ProgressAnalyticsService";
import { mapProgressDashboard } from "../mappers";
import { mapProgressAnalyticsToExperienceDto } from "../mappers/mapProgressAnalyticsToExperienceDto";
import { mapTimeRangeToAnalyticsFilter } from "../mappers/mapTimeRangeToAnalyticsFilter";
import { TimeRanges, type ProgressDashboard, type TimeRange } from "../models";
import { reprojectPendingAnalyticsTimeline } from "./reprojectPendingAnalyticsTimeline";

export interface LoadHydratedProgressExperienceOptions {
  readonly athleteId: string;
  readonly timeRange?: TimeRange;
  readonly reprojectTimeline?: boolean;
}

/**
 * Loads Progress Experience from Progress Analytics read models via Composition Root.
 */
export async function loadHydratedProgressExperience({
  athleteId,
  timeRange = TimeRanges.LAST_30_DAYS,
  reprojectTimeline = true,
}: LoadHydratedProgressExperienceOptions): Promise<ProgressDashboard | null> {
  const root = getCompositionRoot();
  const projector = root.resolve("AnalyticsTimelineProjector");
  const analyticsService = projector.progressAnalyticsService;

  if (reprojectTimeline) {
    reprojectPendingAnalyticsTimeline({ athleteId, projector });
  }

  try {
    const analyticsDto = await analyticsService.getAnalytics(
      mapTimeRangeToAnalyticsFilter(timeRange),
    );
    const experienceDto = mapProgressAnalyticsToExperienceDto({
      analytics: analyticsDto,
      timeRange,
      athleteId,
    });

    return mapProgressDashboard(experienceDto);
  } catch (caught) {
    if (caught instanceof ProgressAnalyticsError) {
      return null;
    }
    throw caught;
  }
}
