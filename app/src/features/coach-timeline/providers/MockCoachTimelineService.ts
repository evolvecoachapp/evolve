import type {
  CoachTimelineDataDto,
  CoachTimelineFrameworkService,
  TimelineCursorDto,
  TimelineEventDto,
  TimelineFilterDto,
  TimelinePeriodDto,
  TimelineSnapshotDto,
  TimelineStatisticsDto,
} from "../services/CoachTimelineFrameworkService";

const defaultPeriod: TimelinePeriodDto = {
  kind: "week",
  label: "This Week",
  startDate: "2026-07-23",
  endDate: "2026-07-29",
};

const defaultFilter: TimelineFilterDto = {
  period: defaultPeriod,
  categories: [
    "workout",
    "nutrition",
    "recovery",
    "coach",
    "profile",
    "notifications",
    "analytics",
    "achievements",
    "synchronization",
    "custom",
  ],
  eventTypes: [
    "workout_completed",
    "workout_skipped",
    "personal_record",
    "goal_reached",
    "goal_updated",
    "weight_updated",
    "measurement_updated",
    "recovery_completed",
    "recovery_missed",
    "nutrition_completed",
    "nutrition_missed",
    "coach_insight",
    "coach_recommendation",
    "reminder_created",
    "reminder_completed",
    "notification_dismissed",
    "profile_updated",
    "achievement_unlocked",
    "synchronization_completed",
    "custom",
  ],
  searchQuery: null,
  includeAttachments: true,
};

function buildEvents(): readonly TimelineEventDto[] {
  return [
    {
      id: "evt-001",
      type: "workout_completed",
      category: "workout",
      priority: "normal",
      title: "Upper Strength completed",
      summary: "62 minutes · 8450 kg volume · RPE 7.5",
      occurredAt: "2026-07-29T07:30:00Z",
      group: "today",
      badges: [{ id: "b-1", label: "Workout", tone: "pulse" }],
      actions: [
        {
          id: "a-1",
          label: "View workout",
          icon: "barbell-outline",
          destination: "/(app)/coach/timeline/evt-001",
        },
      ],
      attachments: [],
      metadata: {
        sourceModule: "workout-engine",
        correlationId: "wo-001",
        tags: ["strength", "upper"],
        extras: { durationMinutes: "62" },
      },
      destination: "/(app)/coach/timeline/evt-001",
    },
    {
      id: "evt-002",
      type: "personal_record",
      category: "achievements",
      priority: "high",
      title: "Bench Press PR",
      summary: "New estimated 1RM: 102.5 kg",
      occurredAt: "2026-07-29T07:45:00Z",
      group: "today",
      badges: [{ id: "b-2", label: "PR", tone: "accent" }],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "achievement-engine",
        correlationId: "pr-001",
        tags: ["bench_press"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-002",
    },
    {
      id: "evt-003",
      type: "nutrition_completed",
      category: "nutrition",
      priority: "normal",
      title: "Lunch logged",
      summary: "Protein target met · 42g",
      occurredAt: "2026-07-28T12:15:00Z",
      group: "yesterday",
      badges: [{ id: "b-3", label: "Nutrition", tone: "muted" }],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "nutrition-engine",
        correlationId: "meal-012",
        tags: ["lunch"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-003",
    },
    {
      id: "evt-004",
      type: "coach_insight",
      category: "coach",
      priority: "high",
      title: "Recovery window recommended",
      summary: "Sleep debt rising — consider an easier session tomorrow.",
      occurredAt: "2026-07-28T18:00:00Z",
      group: "yesterday",
      badges: [{ id: "b-4", label: "Coach", tone: "pulse" }],
      actions: [
        {
          id: "a-2",
          label: "Open coach",
          icon: "chatbubble-outline",
          destination: "/(app)/(tabs)/coach",
        },
      ],
      attachments: [],
      metadata: {
        sourceModule: "coach-intelligence",
        correlationId: "insight-044",
        tags: ["recovery"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-004",
    },
    {
      id: "evt-005",
      type: "recovery_completed",
      category: "recovery",
      priority: "normal",
      title: "Mobility session done",
      summary: "20 minutes · readiness improved",
      occurredAt: "2026-07-27T20:00:00Z",
      group: "earlier_this_week",
      badges: [{ id: "b-5", label: "Recovery", tone: "muted" }],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "recovery-engine",
        correlationId: "rec-009",
        tags: ["mobility"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-005",
    },
    {
      id: "evt-006",
      type: "goal_reached",
      category: "analytics",
      priority: "high",
      title: "Weekly volume goal reached",
      summary: "Hit 30,000 kg training volume this week.",
      occurredAt: "2026-07-26T21:00:00Z",
      group: "earlier_this_week",
      badges: [{ id: "b-6", label: "Goal", tone: "accent" }],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "progress-analytics",
        correlationId: "goal-003",
        tags: ["volume"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-006",
    },
    {
      id: "evt-007",
      type: "weight_updated",
      category: "profile",
      priority: "low",
      title: "Body weight updated",
      summary: "78.2 kg (−0.3 kg)",
      occurredAt: "2026-07-25T08:00:00Z",
      group: "earlier_this_week",
      badges: [],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "athlete-profile",
        correlationId: "bw-021",
        tags: ["body_weight"],
        extras: { weightKg: "78.2" },
      },
      destination: "/(app)/coach/timeline/evt-007",
    },
    {
      id: "evt-008",
      type: "synchronization_completed",
      category: "synchronization",
      priority: "low",
      title: "Sync completed",
      summary: "All modules synchronized successfully.",
      occurredAt: "2026-07-24T06:00:00Z",
      group: "last_week",
      badges: [{ id: "b-8", label: "Sync", tone: "muted" }],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "synchronization-engine",
        correlationId: "sync-100",
        tags: ["ok"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-008",
    },
    {
      id: "evt-009",
      type: "achievement_unlocked",
      category: "achievements",
      priority: "normal",
      title: "Consistency streak",
      summary: "7 training days in a row.",
      occurredAt: "2026-07-20T22:00:00Z",
      group: "this_month",
      badges: [{ id: "b-9", label: "Achievement", tone: "accent" }],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "achievement-engine",
        correlationId: "ach-007",
        tags: ["streak"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-009",
    },
    {
      id: "evt-010",
      type: "reminder_created",
      category: "notifications",
      priority: "low",
      title: "Hydration reminder set",
      summary: "Daily at 10:00",
      occurredAt: "2026-07-10T09:00:00Z",
      group: "earlier",
      badges: [],
      actions: [],
      attachments: [],
      metadata: {
        sourceModule: "notification-center",
        correlationId: "rem-004",
        tags: ["hydration"],
        extras: {},
      },
      destination: "/(app)/coach/timeline/evt-010",
    },
  ];
}

function buildGroups(events: readonly TimelineEventDto[]) {
  const kinds = [
    { kind: "today" as const, label: "Today" },
    { kind: "yesterday" as const, label: "Yesterday" },
    { kind: "earlier_this_week" as const, label: "Earlier this week" },
    { kind: "last_week" as const, label: "Last week" },
    { kind: "this_month" as const, label: "This month" },
    { kind: "earlier" as const, label: "Earlier" },
  ];
  return kinds
    .map((g) => {
      const ids = events.filter((e) => e.group === g.kind).map((e) => e.id);
      return {
        kind: g.kind,
        label: g.label,
        eventIds: ids,
        eventCount: ids.length,
      };
    })
    .filter((g) => g.eventCount > 0);
}

function buildSections(events: readonly TimelineEventDto[]) {
  return buildGroups(events).map((g) => ({
    id: `section-${g.kind}`,
    title: g.label,
    group: g.kind,
    category: null,
    eventCount: g.eventCount,
    destination: `/(app)/coach/timeline/group/${g.kind}`,
  }));
}

function buildStatistics(period: TimelinePeriodDto, events: readonly TimelineEventDto[]): TimelineStatisticsDto {
  return {
    totalEvents: events.length,
    eventsToday: events.filter((e) => e.group === "today").length,
    eventsThisWeek: events.filter((e) =>
      e.group === "today" || e.group === "yesterday" || e.group === "earlier_this_week",
    ).length,
    workoutEvents: events.filter((e) => e.category === "workout").length,
    nutritionEvents: events.filter((e) => e.category === "nutrition").length,
    recoveryEvents: events.filter((e) => e.category === "recovery").length,
    coachEvents: events.filter((e) => e.category === "coach").length,
    achievementEvents: events.filter((e) => e.category === "achievements").length,
    dominantCategory: "workout",
    dominantEventType: "workout_completed",
    period,
    destination: "/(app)/coach/timeline/statistics",
  };
}

function applyFilter(
  events: readonly TimelineEventDto[],
  filter?: TimelineFilterDto,
  searchQuery?: string | null,
): readonly TimelineEventDto[] {
  let result = [...events];
  if (filter) {
    const categories = new Set(filter.categories);
    const types = new Set(filter.eventTypes);
    result = result.filter((e) => categories.has(e.category) && types.has(e.type));
  }
  const query = (searchQuery ?? filter?.searchQuery ?? "").trim().toLowerCase();
  if (query) {
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.summary.toLowerCase().includes(query) ||
        e.type.includes(query) ||
        e.category.includes(query),
    );
  }
  return result;
}

function paginate(
  events: readonly TimelineEventDto[],
  cursor?: TimelineCursorDto | null,
  pageSize = 5,
): {
  readonly page: readonly TimelineEventDto[];
  readonly hasMore: boolean;
  readonly nextCursor: TimelineCursorDto | null;
} {
  let start = 0;
  if (cursor) {
    const idx = events.findIndex((e) => e.id === cursor.value);
    start = idx >= 0 ? idx + 1 : 0;
  }
  const page = events.slice(start, start + pageSize);
  const last = page[page.length - 1];
  const hasMore = start + pageSize < events.length;
  return {
    page,
    hasMore,
    nextCursor: hasMore && last ? { value: last.id, occurredAt: last.occurredAt } : null,
  };
}

function buildData(
  filter?: TimelineFilterDto,
  cursor?: TimelineCursorDto | null,
  searchQuery?: string | null,
): CoachTimelineDataDto {
  const activeFilter = filter ?? defaultFilter;
  const all = applyFilter(buildEvents(), activeFilter, searchQuery);
  const { page, hasMore, nextCursor } = paginate(all, cursor);
  const statistics = buildStatistics(activeFilter.period, all);
  return {
    period: activeFilter.period,
    filter: { ...activeFilter, searchQuery: searchQuery ?? activeFilter.searchQuery ?? null },
    events: page,
    groups: buildGroups(page),
    sections: buildSections(page),
    statistics,
    pagination: {
      pageSize: 5,
      hasMore,
      nextCursor,
      previousCursor: null,
      totalCount: all.length,
    },
    searchQuery: searchQuery ?? activeFilter.searchQuery ?? null,
    snapshot: {
      id: "snap-timeline-001",
      capturedAt: "2026-07-29T12:00:00Z",
      period: activeFilter.period,
      filter: activeFilter,
      events: page,
      groups: buildGroups(page),
      sections: buildSections(page),
      statistics,
      pagination: {
        pageSize: 5,
        hasMore,
        nextCursor,
        previousCursor: null,
        totalCount: all.length,
      },
      searchQuery: searchQuery ?? null,
      notes: "Mock timeline snapshot",
      destination: "/(app)/coach/timeline/snapshot/snap-timeline-001",
    },
  };
}

function emptyData(): CoachTimelineDataDto {
  const filter = defaultFilter;
  const statistics = buildStatistics(filter.period, []);
  return {
    period: filter.period,
    filter,
    events: [],
    groups: [],
    sections: [],
    statistics,
    pagination: {
      pageSize: 5,
      hasMore: false,
      nextCursor: null,
      previousCursor: null,
      totalCount: 0,
    },
    searchQuery: null,
    snapshot: null,
  };
}

let currentData = buildData();

export const mockCoachTimelineService: CoachTimelineFrameworkService = {
  providerId: "mock",
  async getTimeline(filter?: TimelineFilterDto, cursor?: TimelineCursorDto | null) {
    currentData = buildData(filter, cursor, filter?.searchQuery);
    return currentData;
  },
  async loadMore(cursor: TimelineCursorDto) {
    const next = buildData(currentData.filter, cursor, currentData.searchQuery);
    currentData = {
      ...next,
      events: [...currentData.events, ...next.events],
      groups: buildGroups([...currentData.events, ...next.events]),
      sections: buildSections([...currentData.events, ...next.events]),
    };
    return currentData;
  },
  async filterTimeline(filter: TimelineFilterDto) {
    currentData = buildData(filter, null, filter.searchQuery);
    return currentData;
  },
  async searchTimeline(query: string, filter?: TimelineFilterDto) {
    currentData = buildData(filter ?? defaultFilter, null, query);
    return currentData;
  },
  async getStatistics(period?: TimelinePeriodDto) {
    const data = buildData(period ? { ...defaultFilter, period } : defaultFilter);
    return data.statistics;
  },
  async getSnapshot(period?: TimelinePeriodDto): Promise<TimelineSnapshotDto> {
    const data = buildData(period ? { ...defaultFilter, period } : defaultFilter);
    if (!data.snapshot) {
      throw new Error("Mock timeline snapshot unavailable.");
    }
    return data.snapshot;
  },
};

export const emptyMockCoachTimelineService: CoachTimelineFrameworkService = {
  providerId: "mock",
  async getTimeline() {
    return emptyData();
  },
  async loadMore() {
    return emptyData();
  },
  async filterTimeline() {
    return emptyData();
  },
  async searchTimeline() {
    return emptyData();
  },
  async getStatistics(period?: TimelinePeriodDto) {
    return buildStatistics(period ?? defaultPeriod, []);
  },
  async getSnapshot(period?: TimelinePeriodDto): Promise<TimelineSnapshotDto> {
    const empty = emptyData();
    return {
      id: "snap-empty",
      capturedAt: "2026-07-29T12:00:00Z",
      period: period ?? defaultPeriod,
      filter: defaultFilter,
      events: [],
      groups: [],
      sections: [],
      statistics: empty.statistics,
      pagination: empty.pagination,
      searchQuery: null,
      notes: null,
      destination: null,
    };
  },
};

export function resetMockCoachTimelineData(): void {
  currentData = buildData();
}
