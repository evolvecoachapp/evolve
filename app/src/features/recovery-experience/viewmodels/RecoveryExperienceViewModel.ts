import {
  assessRuntimeRecovery,
  changeRecoveryDay,
  loadHydratedRecoveryExperience,
  loadRecoveryDashboard,
  logRuntimeSleep,
  publishRecoveryRuntimeAssessmentProgress,
  publishRecoveryRuntimeReadinessProgress,
  publishRecoveryRuntimeSleepProgress,
  refreshRecoveryDashboard,
  updateRuntimeReadiness,
} from "../application";
import { mapRecoveryDashboard } from "../mappers";
import {
  createRecoveryDay,
  createRecoveryErrorState,
  createRecoveryLoadingState,
  RecoveryLoadingStatuses,
  type RecoveryDashboard,
  type RecoveryDay,
  type RecoveryErrorState,
  type RecoveryLoadingState,
} from "../models";
import {
  RecoveryExperienceError,
  type RecoveryExperienceService,
} from "../services";

export interface RecoveryExperienceViewModelDeps {
  readonly service?: RecoveryExperienceService;
  readonly athleteId?: string;
  readonly initialDay?: RecoveryDay;
  readonly now?: () => Date;
}

const TODAY = createRecoveryDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

/**
 * Recovery Experience ViewModel — application orchestration only.
 * Production path applies hydrated Unified Workspace via applyHydratedRecovery().
 */
export class RecoveryExperienceViewModel {
  private readonly service: RecoveryExperienceService | null;
  private readonly athleteId: string | null;
  private readonly now: () => Date;
  private readonly listeners = new Set<() => void>();
  private _dashboard: RecoveryDashboard | null = null;
  private _loading: RecoveryLoadingState;
  private _error: RecoveryErrorState | null = null;
  private _day: RecoveryDay;
  private _sleepHours = 0;
  private _sleepQuality = 0;
  private _sleepLogged = false;
  private _readinessScore = 0;
  private _assessedScore = 0;

  constructor(deps: RecoveryExperienceViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this.now = deps.now ?? (() => new Date());
    this._day = deps.initialDay ?? TODAY;
    this._loading = createRecoveryLoadingState(
      this.service
        ? RecoveryLoadingStatuses.IDLE
        : RecoveryLoadingStatuses.LOADING,
    );
  }

  /** True when the ViewModel is driven by hydrated workspace instead of RecoveryExperienceService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
  }

  get dashboard(): RecoveryDashboard | null {
    return this._dashboard;
  }
  get loading(): RecoveryLoadingState {
    return this._loading;
  }
  get error(): RecoveryErrorState | null {
    return this._error;
  }
  get day(): RecoveryDay {
    return this._day;
  }
  get availableDays(): readonly RecoveryDay[] {
    return this._dashboard?.availableDays ?? Object.freeze([this._day]);
  }
  get isEmpty(): boolean {
    return (
      !!this._dashboard &&
      this._dashboard.recoveryScore === 0 &&
      this._dashboard.signals.length === 0
    );
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadDashboard(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await loadRecoveryDashboard({ service: this.service, day: this._day });
    } catch (caught) {
      this._dashboard = null;
      this._error = this.toErrorState(caught);
    }
    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await refreshRecoveryDashboard({ service: this.service, day: this._day });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.IDLE);
    this.notify();
  }

  /** Applies a dashboard projected from hydrated Unified Workspace output. */
  applyHydratedRecovery(dashboard: RecoveryDashboard): void {
    this._dashboard = dashboard;
    this._sleepHours = dashboard.sleep.hours;
    this._sleepQuality = dashboard.sleep.quality;
    this._sleepLogged = dashboard.sleep.logged;
    this._readinessScore = dashboard.readiness.score;
    this._assessedScore = dashboard.recoveryScore;
    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies hydrated workspace output (runtime production refresh path). */
  refreshFromHydratedRecovery(dashboard: RecoveryDashboard | null): void {
    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (dashboard) {
      this.applyHydratedRecovery(dashboard);
      return;
    }

    this._dashboard = null;
    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.IDLE);
    this._error = createRecoveryErrorState(
      "Recovery runtime unavailable.",
      "recovery_runtime_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable hydrated recovery output to the Recovery UI. */
  applyRecoveryFailure(message: string): void {
    this._dashboard = null;
    this._loading = createRecoveryLoadingState(RecoveryLoadingStatuses.IDLE);
    this._error = createRecoveryErrorState(message, "recovery_runtime_unavailable");
    this.notify();
  }

  async logSleep(hours: number): Promise<void> {
    if (!this._dashboard || hours <= 0) {
      return;
    }

    if (this.service) {
      try {
        const dto = await this.service.logSleep(this._day, hours);
        this._dashboard = mapRecoveryDashboard(dto);
        this.notify();
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
      return;
    }

    this._dashboard = logRuntimeSleep({ dashboard: this._dashboard, hours });
    this._sleepHours = this._dashboard.sleep.hours;
    this._sleepQuality = this._dashboard.sleep.quality;
    this._sleepLogged = true;
    this._error = null;
    this.notify();

    if (this.athleteId) {
      const loggedAt = this.now().toISOString();
      try {
        await publishRecoveryRuntimeSleepProgress({
          dashboard: this._dashboard,
          sleep: Object.freeze({
            hours: this._dashboard.sleep.hours,
            quality: this._dashboard.sleep.quality,
            label: this._dashboard.sleep.label,
            notes: Object.freeze([]),
          }),
          athleteId: this.athleteId,
          loggedAt,
        });
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
    }
  }

  async updateReadiness(score: number): Promise<void> {
    if (!this._dashboard) {
      return;
    }

    if (this.service) {
      try {
        const dto = await this.service.updateReadiness(this._day, score);
        this._dashboard = mapRecoveryDashboard(dto);
        this.notify();
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
      return;
    }

    this._dashboard = updateRuntimeReadiness({ dashboard: this._dashboard, score });
    this._readinessScore = this._dashboard.readiness.score;
    this._error = null;
    this.notify();

    if (this.athleteId) {
      const updatedAt = this.now().toISOString();
      try {
        await publishRecoveryRuntimeReadinessProgress({
          dashboard: this._dashboard,
          readiness: Object.freeze({
            score: this._dashboard.readiness.score,
            label: this._dashboard.readiness.label,
            notes: Object.freeze([]),
          }),
          athleteId: this.athleteId,
          updatedAt,
        });
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
    }
  }

  async assessRecovery(): Promise<void> {
    if (!this._dashboard || !this._dashboard.assessmentAvailable) {
      return;
    }

    if (this.service) {
      try {
        const dto = await this.service.assessRecovery(this._day);
        this._dashboard = mapRecoveryDashboard(dto);
        this.notify();
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
      return;
    }

    if (!this.athleteId) {
      return;
    }

    const assessedAt = this.now().toISOString();
    const result = assessRuntimeRecovery({
      dashboard: this._dashboard,
      athleteId: this.athleteId,
      assessedAt,
    });
    this._dashboard = result.dashboard;
    this._assessedScore = result.dashboard.recoveryScore;
    this._error = null;
    this.notify();

    try {
      await publishRecoveryRuntimeAssessmentProgress({
        dashboard: result.dashboard,
        assessment: result.assessment,
        athleteId: this.athleteId,
        assessedAt,
      });
    } catch (caught) {
      this._error = this.toErrorState(caught);
      this.notify();
    }
  }

  async changeDay(day: RecoveryDay): Promise<void> {
    this._day = changeRecoveryDay({ day });
    if (this.service) {
      await this.loadDashboard();
      return;
    }

    if (!this.athleteId) {
      this.applyRecoveryFailure("Recovery runtime unavailable.");
      return;
    }

    const dashboard = await loadHydratedRecoveryExperience({
      athleteId: this.athleteId,
      day: this._day,
      sleepHours: this._sleepHours,
      sleepQuality: this._sleepQuality,
      sleepLogged: this._sleepLogged,
      readinessScore: this._readinessScore,
      assessedScore: this._assessedScore,
    });
    this.refreshFromHydratedRecovery(dashboard);
  }

  private toErrorState(caught: unknown): RecoveryErrorState {
    if (caught instanceof RecoveryExperienceError) {
      return createRecoveryErrorState(caught.message, "recovery_experience_service_error", true);
    }
    if (caught instanceof Error) {
      return createRecoveryErrorState(caught.message);
    }
    return createRecoveryErrorState("Failed to load Recovery experience.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
