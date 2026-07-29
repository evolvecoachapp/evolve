import {
  createAthleteTimeline,
  createTimelineEvent,
  createTimelineEventFilter,
  createTimelineGroup,
  createTimelinePagination,
  createTimelinePeriod,
  createTimelineSection,
  createTimelineSnapshot,
  createTimelineStatistics,
  type AthleteTimeline,
  type TimelineEvent,
  type TimelineEventFilter,
  type TimelineGroup,
  type TimelinePagination,
  type TimelineSection,
  type TimelineSnapshot,
  type TimelineStatistics,
} from "../models";
import type {
  CoachTimelineDataDto,
  TimelineEventDto,
  TimelineFilterDto,
  TimelineGroupDto,
  TimelinePaginationDto,
  TimelineSectionDto,
  TimelineSnapshotDto,
  TimelineStatisticsDto,
} from "../services/CoachTimelineFrameworkService";

export type CoachTimelineData = AthleteTimeline;

function mapFilter(dto: TimelineFilterDto): TimelineEventFilter {
  return createTimelineEventFilter({
    period: createTimelinePeriod(dto.period),
    categories: dto.categories,
    eventTypes: dto.eventTypes,
    searchQuery: dto.searchQuery ?? null,
    includeAttachments: dto.includeAttachments,
  });
}

export function mapTimelineEvent(dto: TimelineEventDto): TimelineEvent {
  return createTimelineEvent({
    id: dto.id,
    type: dto.type,
    category: dto.category,
    priority: dto.priority,
    title: dto.title,
    summary: dto.summary,
    occurredAt: dto.occurredAt,
    group: dto.group,
    badges: (dto.badges ?? []).map((b) => ({ ...b })),
    actions: (dto.actions ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      icon: a.icon,
      destination: a.destination ?? null,
    })),
    attachments: (dto.attachments ?? []).map((a) => ({
      id: a.id,
      kind: a.kind,
      label: a.label,
      destination: a.destination ?? null,
    })),
    metadata: {
      sourceModule: dto.metadata.sourceModule,
      correlationId: dto.metadata.correlationId ?? null,
      tags: dto.metadata.tags ?? [],
      extras: dto.metadata.extras ?? {},
    },
    destination: dto.destination ?? null,
  });
}

export function mapTimelineGroup(dto: TimelineGroupDto): TimelineGroup {
  return createTimelineGroup({
    kind: dto.kind,
    label: dto.label,
    eventIds: dto.eventIds,
    eventCount: dto.eventCount,
  });
}

export function mapTimelineSection(dto: TimelineSectionDto): TimelineSection {
  return createTimelineSection({
    id: dto.id,
    title: dto.title,
    group: dto.group,
    category: dto.category ?? null,
    eventCount: dto.eventCount,
    destination: dto.destination ?? null,
  });
}

export function mapTimelinePagination(dto: TimelinePaginationDto): TimelinePagination {
  return createTimelinePagination({
    pageSize: dto.pageSize,
    hasMore: dto.hasMore,
    nextCursor: dto.nextCursor ?? null,
    previousCursor: dto.previousCursor ?? null,
    totalCount: dto.totalCount ?? null,
  });
}

export function mapTimelineStatistics(dto: TimelineStatisticsDto): TimelineStatistics {
  return createTimelineStatistics({
    totalEvents: dto.totalEvents,
    eventsToday: dto.eventsToday,
    eventsThisWeek: dto.eventsThisWeek,
    workoutEvents: dto.workoutEvents,
    nutritionEvents: dto.nutritionEvents,
    recoveryEvents: dto.recoveryEvents,
    coachEvents: dto.coachEvents,
    achievementEvents: dto.achievementEvents,
    dominantCategory: dto.dominantCategory ?? null,
    dominantEventType: dto.dominantEventType ?? null,
    period: createTimelinePeriod(dto.period),
    destination: dto.destination ?? null,
  });
}

export function mapTimelineSnapshot(dto: TimelineSnapshotDto): TimelineSnapshot {
  return createTimelineSnapshot({
    id: dto.id,
    capturedAt: dto.capturedAt,
    period: createTimelinePeriod(dto.period),
    filter: mapFilter(dto.filter),
    events: dto.events.map(mapTimelineEvent),
    groups: dto.groups.map(mapTimelineGroup),
    sections: dto.sections.map(mapTimelineSection),
    statistics: mapTimelineStatistics(dto.statistics),
    pagination: mapTimelinePagination(dto.pagination),
    searchQuery: dto.searchQuery ?? null,
    notes: dto.notes ?? null,
    destination: dto.destination ?? null,
  });
}

export function mapCoachTimelineData(dto: CoachTimelineDataDto): CoachTimelineData {
  return createAthleteTimeline({
    period: createTimelinePeriod(dto.period),
    filter: mapFilter(dto.filter),
    events: dto.events.map(mapTimelineEvent),
    groups: dto.groups.map(mapTimelineGroup),
    sections: dto.sections.map(mapTimelineSection),
    statistics: mapTimelineStatistics(dto.statistics),
    pagination: mapTimelinePagination(dto.pagination),
    searchQuery: dto.searchQuery ?? null,
    snapshot: dto.snapshot ? mapTimelineSnapshot(dto.snapshot) : null,
  });
}
