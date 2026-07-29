/**
 * Coach Timeline
 *
 * Sprint 25.4 — Decision Journal (append-only coach reasoning history).
 * Sprint 31.9 — Coach Timeline Framework Foundation (athlete-event presentation domain).
 *
 * Journal: Conversation → Coach Decision → Journal Entry → Timeline → Coach Memory
 * Framework: React UI → CoachTimelineViewModel → Application → FrameworkService → Mock/Backend/Local
 */

export * from "./models";
export {
  CoachTimelineStore,
  createCoachTimelineStore,
} from "./store/CoachTimelineStore";
export * from "./services";
export * from "./builders";
export {
  appendTimelineEntry,
  queryTimeline,
  buildTimelineSummary,
  getCoachTimeline,
  loadTimeline,
  refreshTimeline,
  loadMoreTimeline,
  filterTimeline as filterAthleteTimeline,
  searchTimeline,
  loadTimelineStatistics,
  loadTimelineSnapshot,
} from "./application";
export type { CoachTimelineServiceDeps } from "./application";

export * from "./hooks";
export * from "./viewmodels";
export * from "./screens";
export * from "./components";
export {
  mockCoachTimelineService,
  emptyMockCoachTimelineService,
  resetMockCoachTimelineData,
} from "./providers/MockCoachTimelineService";
export { backendCoachTimelineService } from "./providers/BackendCoachTimelineService";
export { localCoachTimelineService } from "./providers/LocalCoachTimelineService";
