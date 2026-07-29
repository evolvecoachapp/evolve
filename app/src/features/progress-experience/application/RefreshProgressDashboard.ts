import { loadProgressDashboard } from "./LoadProgressDashboard";
import type { ProgressDashboard, TimeRange } from "../models";
import type { ProgressExperienceService } from "../services";

export async function refreshProgressDashboard(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<ProgressDashboard> {
  return loadProgressDashboard(input);
}
