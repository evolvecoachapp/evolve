import type { TimelineCategory } from "../models/TimelineCategory";
import type { TimelineEventType } from "../models/TimelineEventType";
import type { TimelineGroupKind } from "../models/TimelineGroup";
import type { TimelinePeriodKind } from "../models/TimelinePeriod";
import type { TimelinePriority } from "../models/TimelinePriority";

export interface TimelinePeriodDto {
  readonly kind: TimelinePeriodKind;
  readonly label: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
}

export interface TimelineCursorDto {
  readonly value: string;
  readonly occurredAt: string;
}

export interface TimelinePaginationDto {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: TimelineCursorDto | null;
  readonly previousCursor?: TimelineCursorDto | null;
  readonly totalCount?: number | null;
}

export interface TimelineFilterDto {
  readonly period: TimelinePeriodDto;
  readonly categories: readonly TimelineCategory[];
  readonly eventTypes: readonly TimelineEventType[];
  readonly searchQuery?: string | null;
  readonly includeAttachments: boolean;
}

export interface TimelineActionDto {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly destination?: string | null;
}

export interface TimelineBadgeDto {
  readonly id: string;
  readonly label: string;
  readonly tone: string;
}

export interface TimelineAttachmentDto {
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly destination?: string | null;
}

export interface TimelineMetadataDto {
  readonly sourceModule: string;
  readonly correlationId?: string | null;
  readonly tags?: readonly string[];
  readonly extras?: Readonly<Record<string, string>>;
}

export interface TimelineEventDto {
  readonly id: string;
  readonly type: TimelineEventType;
  readonly category: TimelineCategory;
  readonly priority: TimelinePriority;
  readonly title: string;
  readonly summary: string;
  readonly occurredAt: string;
  readonly group: TimelineGroupKind;
  readonly badges?: readonly TimelineBadgeDto[];
  readonly actions?: readonly TimelineActionDto[];
  readonly attachments?: readonly TimelineAttachmentDto[];
  readonly metadata: TimelineMetadataDto;
  readonly destination?: string | null;
}

export interface TimelineGroupDto {
  readonly kind: TimelineGroupKind;
  readonly label: string;
  readonly eventIds: readonly string[];
  readonly eventCount: number;
}

export interface TimelineSectionDto {
  readonly id: string;
  readonly title: string;
  readonly group: TimelineGroupKind;
  readonly category?: TimelineCategory | null;
  readonly eventCount: number;
  readonly destination?: string | null;
}

export interface TimelineStatisticsDto {
  readonly totalEvents: number;
  readonly eventsToday: number;
  readonly eventsThisWeek: number;
  readonly workoutEvents: number;
  readonly nutritionEvents: number;
  readonly recoveryEvents: number;
  readonly coachEvents: number;
  readonly achievementEvents: number;
  readonly dominantCategory?: TimelineCategory | null;
  readonly dominantEventType?: TimelineEventType | null;
  readonly period: TimelinePeriodDto;
  readonly destination?: string | null;
}

export interface TimelineSnapshotDto {
  readonly id: string;
  readonly capturedAt: string;
  readonly period: TimelinePeriodDto;
  readonly filter: TimelineFilterDto;
  readonly events: readonly TimelineEventDto[];
  readonly groups: readonly TimelineGroupDto[];
  readonly sections: readonly TimelineSectionDto[];
  readonly statistics: TimelineStatisticsDto;
  readonly pagination: TimelinePaginationDto;
  readonly searchQuery?: string | null;
  readonly notes?: string | null;
  readonly destination?: string | null;
}

export interface CoachTimelineDataDto {
  readonly period: TimelinePeriodDto;
  readonly filter: TimelineFilterDto;
  readonly events: readonly TimelineEventDto[];
  readonly groups: readonly TimelineGroupDto[];
  readonly sections: readonly TimelineSectionDto[];
  readonly statistics: TimelineStatisticsDto;
  readonly pagination: TimelinePaginationDto;
  readonly searchQuery?: string | null;
  readonly snapshot?: TimelineSnapshotDto | null;
}

/**
 * Phase 31.9 Coach Timeline Framework provider contract.
 * Distinct from the ADR-086 Decision Journal `CoachTimelineService` class.
 */
export type CoachTimelineProviderId = "mock" | "backend" | "local";

export interface CoachTimelineFrameworkService {
  readonly providerId: CoachTimelineProviderId;
  getTimeline(filter?: TimelineFilterDto, cursor?: TimelineCursorDto | null): Promise<CoachTimelineDataDto>;
  loadMore(cursor: TimelineCursorDto): Promise<CoachTimelineDataDto>;
  filterTimeline(filter: TimelineFilterDto): Promise<CoachTimelineDataDto>;
  searchTimeline(query: string, filter?: TimelineFilterDto): Promise<CoachTimelineDataDto>;
  getStatistics(period?: TimelinePeriodDto): Promise<TimelineStatisticsDto>;
  getSnapshot(period?: TimelinePeriodDto): Promise<TimelineSnapshotDto>;
}

/** Sprint-facing alias for the Timeline Service provider seam. */
export type CoachTimelineServiceContract = CoachTimelineFrameworkService;

export class CoachTimelineFrameworkError extends Error {
  constructor(message: string, readonly providerId?: CoachTimelineProviderId) {
    super(message);
    this.name = "CoachTimelineFrameworkError";
  }
}
