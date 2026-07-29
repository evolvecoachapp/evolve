import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";
import type { CoachTimeline } from "../models/CoachTimeline";
import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import type { CoachTimelineSummary } from "../models/CoachTimelineSummary";
import type { CoachTimelineSummaryKind } from "../models/CoachTimelineSummary";
import type { TimelineQuery } from "../models/TimelineQuery";
import type { TimelineResult } from "../models/TimelineResult";
import {
  createCoachTimelineService,
  type CoachTimelineService,
  type CoachTimelineServiceDeps,
} from "../services/CoachTimelineService";

function resolveService(
  service: CoachTimelineService | undefined,
  deps: CoachTimelineServiceDeps | undefined,
): CoachTimelineService {
  if (service) return service;
  return createCoachTimelineService(deps ?? {});
}

/** Public API — append a brand-new immutable timeline entry. */
export function appendTimelineEntry(options: {
  readonly request: AppendTimelineEntryRequest;
  readonly service?: CoachTimelineService;
  readonly deps?: CoachTimelineServiceDeps;
}): CoachTimelineEntry {
  return resolveService(options.service, options.deps).appendEntry(
    options.request,
  );
}

/** Public API — query the Coach Timeline. */
export function queryTimeline(options: {
  readonly query: TimelineQuery;
  readonly service?: CoachTimelineService;
  readonly deps?: CoachTimelineServiceDeps;
}): TimelineResult {
  return resolveService(options.service, options.deps).query(options.query);
}

/** Public API — build a deterministic timeline summary. */
export function buildTimelineSummary(options: {
  readonly athleteId: string;
  readonly kind: CoachTimelineSummaryKind;
  readonly service?: CoachTimelineService;
  readonly deps?: CoachTimelineServiceDeps;
}): CoachTimelineSummary {
  return resolveService(options.service, options.deps).buildSummary(
    options.athleteId,
    options.kind,
  );
}

/** Public API — read full timeline for an athlete. */
export function getCoachTimeline(options: {
  readonly athleteId: string;
  readonly service?: CoachTimelineService;
  readonly deps?: CoachTimelineServiceDeps;
}): CoachTimeline | null {
  return resolveService(options.service, options.deps).getTimeline(
    options.athleteId,
  );
}

export type { CoachTimelineServiceDeps };

export * from "./LoadTimeline";
export * from "./RefreshTimeline";
export * from "./LoadMoreTimeline";
export * from "./FilterTimeline";
export * from "./SearchTimeline";
export * from "./LoadTimelineStatistics";
export * from "./LoadTimelineSnapshot";
