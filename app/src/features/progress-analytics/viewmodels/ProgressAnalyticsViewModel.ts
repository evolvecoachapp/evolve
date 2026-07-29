import {
  loadAnalytics,
  loadAnalyticsSnapshot,
  loadBodyMeasurements,
  loadGoalProgress,
  loadNutritionStatistics,
  loadPersonalRecords,
  loadRecoveryStatistics,
  loadStrengthProgress,
  loadWorkoutHistory,
  refreshAnalytics,
} from "../application";
import type { ProgressAnalyticsData } from "../mappers";
import {
  createAnalyticsErrorState,
  createAnalyticsLoadingState,
  AnalyticsLoadingStatuses,
  type AnalyticsErrorState,
  type AnalyticsLoadingState,
  type AnalyticsSnapshot,
  type BodyMeasurement,
  type GoalProgress,
  type NutritionStatistics,
  type PersonalRecord,
  type ProgressChart,
  type ProgressSummary,
  type RecoveryStatistics,
  type StrengthProgress,
  type WorkoutHistory,
  type AnalyticsFilter,
  type AnalyticsPeriod,
  type BodyComposition,
  type BodyWeightHistory,
  type PerformanceTrend,
  type SleepStatistics,
  type TrainingConsistency,
  type VolumeProgress,
  type WorkoutStatistics,
} from "../models";
import {
  progressAnalyticsService,
  ProgressAnalyticsError,
  type AnalyticsFilterDto,
  type ProgressAnalyticsService,
} from "../services";

export interface ProgressAnalyticsViewModelDeps {
  readonly service?: ProgressAnalyticsService;
}

export class ProgressAnalyticsViewModel {
  private readonly service: ProgressAnalyticsService;
  private readonly listeners = new Set<() => void>();
  private _period: AnalyticsPeriod | null = null;
  private _filter: AnalyticsFilter | null = null;
  private _summary: ProgressSummary | null = null;
  private _workoutHistory: WorkoutHistory | null = null;
  private _workoutStatistics: WorkoutStatistics | null = null;
  private _strengthProgress: StrengthProgress | null = null;
  private _volumeProgress: VolumeProgress | null = null;
  private _bodyMeasurements: readonly BodyMeasurement[] = Object.freeze([]);
  private _bodyComposition: BodyComposition | null = null;
  private _bodyWeightHistory: BodyWeightHistory | null = null;
  private _nutritionStatistics: NutritionStatistics | null = null;
  private _recoveryStatistics: RecoveryStatistics | null = null;
  private _sleepStatistics: SleepStatistics | null = null;
  private _performanceTrends: readonly PerformanceTrend[] = Object.freeze([]);
  private _goalProgress: readonly GoalProgress[] = Object.freeze([]);
  private _personalRecords: readonly PersonalRecord[] = Object.freeze([]);
  private _trainingConsistency: TrainingConsistency | null = null;
  private _charts: readonly ProgressChart[] = Object.freeze([]);
  private _snapshot: AnalyticsSnapshot | null = null;
  private _loading: AnalyticsLoadingState = createAnalyticsLoadingState(AnalyticsLoadingStatuses.IDLE);
  private _error: AnalyticsErrorState | null = null;

  constructor(deps: ProgressAnalyticsViewModelDeps = {}) {
    this.service = deps.service ?? progressAnalyticsService;
  }

  get period(): AnalyticsPeriod | null { return this._period; }
  get filter(): AnalyticsFilter | null { return this._filter; }
  get summary(): ProgressSummary | null { return this._summary; }
  get workoutHistory(): WorkoutHistory | null { return this._workoutHistory; }
  get workoutStatistics(): WorkoutStatistics | null { return this._workoutStatistics; }
  get strengthProgress(): StrengthProgress | null { return this._strengthProgress; }
  get volumeProgress(): VolumeProgress | null { return this._volumeProgress; }
  get bodyMeasurements(): readonly BodyMeasurement[] { return this._bodyMeasurements; }
  get bodyComposition(): BodyComposition | null { return this._bodyComposition; }
  get bodyWeightHistory(): BodyWeightHistory | null { return this._bodyWeightHistory; }
  get nutritionStatistics(): NutritionStatistics | null { return this._nutritionStatistics; }
  get recoveryStatistics(): RecoveryStatistics | null { return this._recoveryStatistics; }
  get sleepStatistics(): SleepStatistics | null { return this._sleepStatistics; }
  get performanceTrends(): readonly PerformanceTrend[] { return this._performanceTrends; }
  get goalProgress(): readonly GoalProgress[] { return this._goalProgress; }
  get personalRecords(): readonly PersonalRecord[] { return this._personalRecords; }
  get trainingConsistency(): TrainingConsistency | null { return this._trainingConsistency; }
  get charts(): readonly ProgressChart[] { return this._charts; }
  get snapshot(): AnalyticsSnapshot | null { return this._snapshot; }
  get loading(): AnalyticsLoadingState { return this._loading; }
  get error(): AnalyticsErrorState | null { return this._error; }
  get isEmpty(): boolean {
    return (this._summary?.workoutsCompleted ?? 0) === 0 &&
      (this._workoutHistory?.entries.length ?? 0) === 0 &&
      this._personalRecords.length === 0 &&
      this._goalProgress.length === 0;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadAnalytics(filter?: AnalyticsFilterDto): Promise<void> {
    this._loading = createAnalyticsLoadingState(AnalyticsLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await loadAnalytics({ service: this.service, filter }));
    } catch (caught) {
      this.clearData();
      this._error = this.toErrorState(caught);
    }
    this._loading = createAnalyticsLoadingState(AnalyticsLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(filter?: AnalyticsFilterDto): Promise<void> {
    this._loading = createAnalyticsLoadingState(AnalyticsLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this.applyData(await refreshAnalytics({ service: this.service, filter }));
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createAnalyticsLoadingState(AnalyticsLoadingStatuses.IDLE);
    this.notify();
  }

  async loadWorkoutHistory(): Promise<void> {
    try {
      this._workoutHistory = await loadWorkoutHistory({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadBodyMeasurements(): Promise<void> {
    try {
      this._bodyMeasurements = await loadBodyMeasurements({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadStrengthProgress(): Promise<void> {
    try {
      this._strengthProgress = await loadStrengthProgress({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadNutritionStatistics(): Promise<void> {
    try {
      this._nutritionStatistics = await loadNutritionStatistics({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadRecoveryStatistics(): Promise<void> {
    try {
      this._recoveryStatistics = await loadRecoveryStatistics({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadGoalProgress(): Promise<void> {
    try {
      this._goalProgress = await loadGoalProgress({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadPersonalRecords(): Promise<void> {
    try {
      this._personalRecords = await loadPersonalRecords({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadAnalyticsSnapshot(): Promise<void> {
    try {
      this._snapshot = await loadAnalyticsSnapshot({ service: this.service });
      this._error = null;
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  private applyData(data: ProgressAnalyticsData): void {
    this._period = data.period;
    this._filter = data.filter;
    this._summary = data.summary;
    this._workoutHistory = data.workoutHistory;
    this._workoutStatistics = data.workoutStatistics;
    this._strengthProgress = data.strengthProgress;
    this._volumeProgress = data.volumeProgress;
    this._bodyMeasurements = data.bodyMeasurements;
    this._bodyComposition = data.bodyComposition;
    this._bodyWeightHistory = data.bodyWeightHistory;
    this._nutritionStatistics = data.nutritionStatistics;
    this._recoveryStatistics = data.recoveryStatistics;
    this._sleepStatistics = data.sleepStatistics;
    this._performanceTrends = data.performanceTrends;
    this._goalProgress = data.goalProgress;
    this._personalRecords = data.personalRecords;
    this._trainingConsistency = data.trainingConsistency;
    this._charts = data.charts;
    this._snapshot = data.snapshot;
  }

  private clearData(): void {
    this._period = null;
    this._filter = null;
    this._summary = null;
    this._workoutHistory = null;
    this._workoutStatistics = null;
    this._strengthProgress = null;
    this._volumeProgress = null;
    this._bodyMeasurements = Object.freeze([]);
    this._bodyComposition = null;
    this._bodyWeightHistory = null;
    this._nutritionStatistics = null;
    this._recoveryStatistics = null;
    this._sleepStatistics = null;
    this._performanceTrends = Object.freeze([]);
    this._goalProgress = Object.freeze([]);
    this._personalRecords = Object.freeze([]);
    this._trainingConsistency = null;
    this._charts = Object.freeze([]);
    this._snapshot = null;
  }

  private toErrorState(caught: unknown): AnalyticsErrorState {
    if (caught instanceof ProgressAnalyticsError) {
      return createAnalyticsErrorState(caught.message, "progress_analytics_service_error", true);
    }
    if (caught instanceof Error) {
      return createAnalyticsErrorState(caught.message);
    }
    return createAnalyticsErrorState("Failed to load Progress Analytics.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
