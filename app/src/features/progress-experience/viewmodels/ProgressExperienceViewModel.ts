import {
  changeTimeRange,
  loadBodyMetrics,
  loadCoachInsights,
  loadNutritionProgress,
  loadProgressDashboard,
  loadRecoveryProgress,
  loadStrengthProgress,
  loadVolumeProgress,
  refreshProgressDashboard,
} from "../application";
import {
  TimeRanges,
  createProgressErrorState,
  createProgressLoadingState,
  ProgressLoadingStatuses,
  type BodyMetrics,
  type CoachInsightSummary,
  type NutritionProgress,
  type ProgressDashboard,
  type ProgressErrorState,
  type ProgressLoadingState,
  type RecoveryProgress,
  type StrengthProgress,
  type TimeRange,
  type VolumeProgress,
} from "../models";
import { progressExperienceService, ProgressExperienceError, type ProgressExperienceService } from "../services";

export interface ProgressExperienceViewModelDeps {
  readonly service?: ProgressExperienceService;
  readonly initialTimeRange?: TimeRange;
}

export class ProgressExperienceViewModel {
  private readonly service: ProgressExperienceService;
  private readonly listeners = new Set<() => void>();
  private _dashboard: ProgressDashboard | null = null;
  private _loading: ProgressLoadingState = createProgressLoadingState(ProgressLoadingStatuses.IDLE);
  private _error: ProgressErrorState | null = null;
  private _timeRange: TimeRange;

  constructor(deps: ProgressExperienceViewModelDeps = {}) {
    this.service = deps.service ?? progressExperienceService;
    this._timeRange = deps.initialTimeRange ?? TimeRanges.LAST_30_DAYS;
  }

  get dashboard(): ProgressDashboard | null { return this._dashboard; }
  get loading(): ProgressLoadingState { return this._loading; }
  get error(): ProgressErrorState | null { return this._error; }
  get timeRange(): TimeRange { return this._timeRange; }
  get strength(): StrengthProgress | null { return this._dashboard?.strength ?? null; }
  get volume(): VolumeProgress | null { return this._dashboard?.volume ?? null; }
  get recovery(): RecoveryProgress | null { return this._dashboard?.recovery ?? null; }
  get nutrition(): NutritionProgress | null { return this._dashboard?.nutrition ?? null; }
  get bodyMetrics(): BodyMetrics | null { return this._dashboard?.bodyMetrics ?? null; }
  get coachInsights(): readonly CoachInsightSummary[] { return this._dashboard?.coachInsights ?? Object.freeze([]); }
  get isEmpty(): boolean {
    return !!this._dashboard &&
      this._dashboard.personalRecords.length === 0 &&
      this._dashboard.coachInsights.length === 0 &&
      this._dashboard.trainingStreak.currentDays === 0 &&
      this._dashboard.volume.totalVolumeKg === 0;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async loadDashboard(): Promise<void> {
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await loadProgressDashboard({ service: this.service, timeRange: this._timeRange });
    } catch (caught) {
      this._dashboard = null;
      this._error = this.toErrorState(caught);
    }
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(): Promise<void> {
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await refreshProgressDashboard({ service: this.service, timeRange: this._timeRange });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.IDLE);
    this.notify();
  }

  async changeTimeRange(nextTimeRange: string): Promise<void> {
    this._timeRange = changeTimeRange(nextTimeRange);
    await this.loadDashboard();
  }

  async loadStrengthProgress(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const strength = await loadStrengthProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, strength });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadVolumeProgress(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const volume = await loadVolumeProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, volume });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadRecoveryProgress(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const recovery = await loadRecoveryProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, recovery });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadNutritionProgress(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const nutrition = await loadNutritionProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, nutrition });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadBodyMetrics(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const bodyMetrics = await loadBodyMetrics({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, bodyMetrics });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadCoachInsights(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const coachInsights = await loadCoachInsights({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, coachInsights: Object.freeze([...coachInsights]) });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  private toErrorState(caught: unknown): ProgressErrorState {
    if (caught instanceof ProgressExperienceError) {
      return createProgressErrorState(caught.message, "progress_experience_service_error", true);
    }
    if (caught instanceof Error) {
      return createProgressErrorState(caught.message);
    }
    return createProgressErrorState("Failed to load Progress experience.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
