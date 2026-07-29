import type { CoachTimelineFrameworkService } from "../services/CoachTimelineFrameworkService";
import { CoachTimelineFrameworkError } from "../services/CoachTimelineFrameworkService";

export const backendCoachTimelineService: CoachTimelineFrameworkService = {
  providerId: "backend",
  async getTimeline() {
    throw new CoachTimelineFrameworkError("Backend coach timeline provider is not configured.", "backend");
  },
  async loadMore() {
    throw new CoachTimelineFrameworkError("Backend coach timeline provider is not configured.", "backend");
  },
  async filterTimeline() {
    throw new CoachTimelineFrameworkError("Backend coach timeline provider is not configured.", "backend");
  },
  async searchTimeline() {
    throw new CoachTimelineFrameworkError("Backend coach timeline provider is not configured.", "backend");
  },
  async getStatistics() {
    throw new CoachTimelineFrameworkError("Backend coach timeline provider is not configured.", "backend");
  },
  async getSnapshot() {
    throw new CoachTimelineFrameworkError("Backend coach timeline provider is not configured.", "backend");
  },
};
