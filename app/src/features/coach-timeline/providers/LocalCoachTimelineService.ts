import type { CoachTimelineFrameworkService } from "../services/CoachTimelineFrameworkService";
import { CoachTimelineFrameworkError } from "../services/CoachTimelineFrameworkService";

export const localCoachTimelineService: CoachTimelineFrameworkService = {
  providerId: "local",
  async getTimeline() {
    throw new CoachTimelineFrameworkError("Local coach timeline provider is not configured.", "local");
  },
  async loadMore() {
    throw new CoachTimelineFrameworkError("Local coach timeline provider is not configured.", "local");
  },
  async filterTimeline() {
    throw new CoachTimelineFrameworkError("Local coach timeline provider is not configured.", "local");
  },
  async searchTimeline() {
    throw new CoachTimelineFrameworkError("Local coach timeline provider is not configured.", "local");
  },
  async getStatistics() {
    throw new CoachTimelineFrameworkError("Local coach timeline provider is not configured.", "local");
  },
  async getSnapshot() {
    throw new CoachTimelineFrameworkError("Local coach timeline provider is not configured.", "local");
  },
};
