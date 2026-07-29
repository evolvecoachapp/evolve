import { TimeRanges, isTimeRange, type TimeRange } from "../models";

export function changeTimeRange(nextTimeRange: string): TimeRange {
  return isTimeRange(nextTimeRange) ? nextTimeRange : TimeRanges.LAST_30_DAYS;
}
