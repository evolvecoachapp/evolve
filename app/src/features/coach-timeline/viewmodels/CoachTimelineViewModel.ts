import {
  filterTimeline,
  loadMoreTimeline,
  loadTimeline,
  loadTimelineSnapshot,
  loadTimelineStatistics,
  refreshTimeline,
  searchTimeline,
} from "../application";
import type { CoachTimelineData } from "../mappers";
import {
  createTimelineErrorState,
  createTimelineLoadingState,
  TimelineLoadingStatuses,
  type TimelineErrorState,
  type TimelineEvent,
  type TimelineEventFilter,
  type TimelineGroup,
  type TimelineLoadingState,
  type TimelinePagination,
  type TimelinePeriod,
  type TimelineSection,
  type TimelineSnapshot,
  type TimelineStatistics,
} from "../models";
import {
  coachTimelineFrameworkService,
  CoachTimelineFrameworkError,
  type CoachTimelineFrameworkService,
  type TimelineCursorDto,
  type TimelineFilterDto,
} from "../services";

export interface CoachTimelineViewModelDeps {
  readonly service?: CoachTimelineFrameworkService;
}

export class CoachTimelineViewModel {
  private readonly service: CoachTimelineFrameworkService;
  private readonly listeners = new Set<() => void>();
  private _period: TimelinePeriod | null = null;
  private _filter: TimelineEventFilter | null = null;
  private _events: readonly TimelineEvent[] = Object.freeze([]);
  private _groups: readonly TimelineGroup[] = Object.freeze([]);
  private _sections: readonly TimelineSection[] = Object.freeze([]);
  private _statistics: TimelineStatistics | null = null;
  private _pagination: TimelinePagination | null = null;
  private _searchQuery: string | null = null;
  private _snapshot: TimelineSnapshot | null = null;
  private _loading: TimelineLoadingState = createTimelineLoadingState(TimelineLoadingStatuses.IDLE);
  private _error: TimelineErrorState | null = null;

  constructor(deps: CoachTimelineViewModelDeps = {}) {
    this.service = deps.service ?? coachTimelineFrameworkService;
  }

  get period(): TimelinePeriod | null { return this._period; }
  get filter(): TimelineEventFilter | null { return this._filter; }
  get events(): readonly TimelineEvent[] { return this._events; }
  get groups(): readonly TimelineGroup[] { return this._groups; }
  get sections(): readonly TimelineSection[] { return this._sections; }
  get statistics(): TimelineStatistics | null { return this._statistics; }
  get pagination(): TimelinePagination | null { return this._pagination; }
  get searchQuery(): string | null { return this._searchQuery; }
  get snapshot(): TimelineSnapshot | null { return this._snapshot; }
  get loading(): TimelineLoadingState { return this._loading; }
  get error(): TimelineErrorState | null { return this._error; }
  get isEmpty(): boolean {
    return this._events.length === 0 && (this._statistics?.totalEvents ?? 0) === 0;
  }
  get hasMore(): boolean {
    return this._pagination?.hasMore ?? false;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadTimeline(filter?: TimelineFilterDto): Promise<void> {
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await loadTimeline({ service: this.service, filter }));
    } catch (caught) {
      this.clearData();
      this._error = this.toErrorState(caught);
    }
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(filter?: TimelineFilterDto): Promise<void> {
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await refreshTimeline({ service: this.service, filter }));
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.IDLE);
    this.notify();
  }

  async loadMore(): Promise<void> {
    const cursor = this._pagination?.nextCursor;
    if (!cursor) return;
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.LOADING_MORE);
    this._error = null;
    this.notify();
    try {
      const cursorDto: TimelineCursorDto = { value: cursor.value, occurredAt: cursor.occurredAt };
      this.applyData(await loadMoreTimeline({ service: this.service, cursor: cursorDto }));
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.IDLE);
    this.notify();
  }

  async applyFilter(filter: TimelineFilterDto): Promise<void> {
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await filterTimeline({ service: this.service, filter }));
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.IDLE);
    this.notify();
  }

  async search(query: string, filter?: TimelineFilterDto): Promise<void> {
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await searchTimeline({ service: this.service, query, filter }));
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createTimelineLoadingState(TimelineLoadingStatuses.IDLE);
    this.notify();
  }

  async loadStatistics(): Promise<void> {
    try {
      this._statistics = await loadTimelineStatistics({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadSnapshot(): Promise<void> {
    try {
      this._snapshot = await loadTimelineSnapshot({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  private applyData(data: CoachTimelineData): void {
    this._period = data.period;
    this._filter = data.filter;
    this._events = data.events;
    this._groups = data.groups;
    this._sections = data.sections;
    this._statistics = data.statistics;
    this._pagination = data.pagination;
    this._searchQuery = data.searchQuery;
    this._snapshot = data.snapshot;
  }

  private clearData(): void {
    this._period = null;
    this._filter = null;
    this._events = Object.freeze([]);
    this._groups = Object.freeze([]);
    this._sections = Object.freeze([]);
    this._statistics = null;
    this._pagination = null;
    this._searchQuery = null;
    this._snapshot = null;
  }

  private toErrorState(caught: unknown): TimelineErrorState {
    if (caught instanceof CoachTimelineFrameworkError) {
      return createTimelineErrorState(caught.message, "coach_timeline_service_error", true);
    }
    if (caught instanceof Error) {
      return createTimelineErrorState(caught.message);
    }
    return createTimelineErrorState("Failed to load Coach Timeline.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
