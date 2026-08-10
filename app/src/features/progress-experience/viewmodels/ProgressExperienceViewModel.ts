import {
  changeTimeRange,
  loadBodyMetrics,
  loadCoachInsights,
  loadHydratedProgressExperience,
  loadNutritionProgress,
  loadProgressDashboard,
  loadRecoveryProgress,
  loadStrengthProgress,
  loadVolumeProgress,
  refreshProgressDashboard,
} from "../application";
import { ProgressRuntimeError } from "../application/ProgressRuntimeError";
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
import { ProgressExperienceError, type ProgressExperienceService } from "../services";

export interface ProgressExperienceViewModelDeps {
  readonly service?: ProgressExperienceService;
  readonly athleteId?: string;
  readonly initialTimeRange?: TimeRange;
}

/**
 * Progress Experience ViewModel — application orchestration only.
 * Production path applies Progress Analytics read models via applyHydratedProgress().
 */
export class ProgressExperienceViewModel {
  private readonly service: ProgressExperienceService | null;
  private readonly athleteId: string | null;
  private readonly listeners = new Set<() => void>();
  private _dashboard: ProgressDashboard | null = null;
  private _loading: ProgressLoadingState;
  private _error: ProgressErrorState | null = null;
  private _timeRange: TimeRange;

  constructor(deps: ProgressExperienceViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this._timeRange = deps.initialTimeRange ?? TimeRanges.LAST_30_DAYS;
    this._loading = createProgressLoadingState(
      this.service ? ProgressLoadingStatuses.IDLE : ProgressLoadingStatuses.LOADING,
    );
  }

  /** True when the ViewModel is driven by Progress Analytics instead of ProgressExperienceService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
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
    if (!this.service) {
      return;
    }

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

  /** Applies Progress Experience projected from Progress Analytics read models. */
  applyHydratedProgress(dashboard: ProgressDashboard): void {
    this._dashboard = dashboard;
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies Progress Analytics output (runtime production refresh path). */
  refreshFromHydratedProgress(dashboard: ProgressDashboard | null): void {
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (dashboard) {
      this.applyHydratedProgress(dashboard);
      return;
    }

    this._dashboard = null;
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.IDLE);
    this._error = createProgressErrorState(
      "Progress analytics runtime unavailable.",
      "progress_runtime_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable Progress Analytics output to the UI. */
  applyProgressFailure(message: string): void {
    this._dashboard = null;
    this._loading = createProgressLoadingState(ProgressLoadingStatuses.IDLE);
    this._error = createProgressErrorState(message, "progress_runtime_unavailable");
    this.notify();
  }

  async refresh(): Promise<void> {
    if (!this.service) {
      await this.reloadHydratedProgress(ProgressLoadingStatuses.REFRESHING);
      return;
    }

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

    if (!this.service) {
      await this.reloadHydratedProgress(ProgressLoadingStatuses.LOADING);
      return;
    }

    await this.loadDashboard();
  }

  async loadStrengthProgress(): Promise<void> {
    if (!this._dashboard || !this.service) {
      return;
    }

    try {
      const strength = await loadStrengthProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, strength });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadVolumeProgress(): Promise<void> {
    if (!this._dashboard || !this.service) {
      return;
    }

    try {
      const volume = await loadVolumeProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, volume });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadRecoveryProgress(): Promise<void> {
    if (!this._dashboard || !this.service) {
      return;
    }

    try {
      const recovery = await loadRecoveryProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, recovery });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadNutritionProgress(): Promise<void> {
    if (!this._dashboard || !this.service) {
      return;
    }

    try {
      const nutrition = await loadNutritionProgress({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, nutrition });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadBodyMetrics(): Promise<void> {
    if (!this._dashboard || !this.service) {
      return;
    }

    try {
      const bodyMetrics = await loadBodyMetrics({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({ ...this._dashboard, bodyMetrics });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadCoachInsights(): Promise<void> {
    if (!this._dashboard || !this.service) {
      return;
    }

    try {
      const coachInsights = await loadCoachInsights({ service: this.service, timeRange: this._timeRange });
      this._dashboard = Object.freeze({
        ...this._dashboard,
        coachInsights: Object.freeze([...coachInsights]),
      });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  private async requireHydratedDashboard(): Promise<ProgressDashboard> {
    if (!this.athleteId) {
      throw new ProgressRuntimeError("Progress analytics runtime unavailable.");
    }

    const dashboard = await loadHydratedProgressExperience({
      athleteId: this.athleteId,
      timeRange: this._timeRange,
    });

    if (!dashboard) {
      throw new ProgressRuntimeError("Progress analytics runtime unavailable.");
    }

    return dashboard;
  }

  private async reloadHydratedProgress(
    loadingStatus:
      | typeof ProgressLoadingStatuses.REFRESHING
      | typeof ProgressLoadingStatuses.LOADING = ProgressLoadingStatuses.LOADING,
  ): Promise<void> {
    this._loading = createProgressLoadingState(loadingStatus);
    this._error = null;
    this.notify();

    try {
      const dashboard = await this.requireHydratedDashboard();
      this.applyHydratedProgress(dashboard);
    } catch (caught) {
      this.applyProgressFailure(
        caught instanceof Error ? caught.message : "Progress analytics runtime unavailable.",
      );
    }
  }

  private toErrorState(caught: unknown): ProgressErrorState {
    if (caught instanceof ProgressExperienceError) {
      return createProgressErrorState(caught.message, "progress_experience_service_error", true);
    }
    if (caught instanceof ProgressRuntimeError) {
      return createProgressErrorState(caught.message, "progress_runtime_unavailable", true);
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
