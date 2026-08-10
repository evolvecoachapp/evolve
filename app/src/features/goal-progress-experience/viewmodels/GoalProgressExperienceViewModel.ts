import {
  completeRuntimeGoal,
  completeRuntimeMilestone,
  loadGoalProgressDashboard,
  loadHydratedGoalProgressExperience,
  publishGoalRuntimeCompletionProgress,
  publishGoalRuntimeMilestoneProgress,
  publishGoalRuntimeProgressUpdated,
  refreshGoalProgressDashboard,
  updateRuntimeGoalProgress,
} from "../application";
import { mapGoalProgressDashboard } from "../mappers";
import {
  createGoalProgressErrorState,
  createGoalProgressLoadingState,
  GoalProgressLoadingStatuses,
  type GoalProgressDashboard,
  type GoalProgressErrorState,
  type GoalProgressLoadingState,
} from "../models";
import {
  GoalProgressExperienceError,
  type GoalProgressExperienceService,
} from "../services";

export interface GoalProgressExperienceViewModelDeps {
  readonly service?: GoalProgressExperienceService;
  readonly athleteId?: string;
  readonly now?: () => Date;
}

/**
 * Goal Progress Experience ViewModel — application orchestration only.
 * Production path applies hydrated Unified Workspace via applyHydratedGoalProgress().
 */
export class GoalProgressExperienceViewModel {
  private readonly service: GoalProgressExperienceService | null;
  private readonly athleteId: string | null;
  private readonly now: () => Date;
  private readonly listeners = new Set<() => void>();
  private _dashboard: GoalProgressDashboard | null = null;
  private _loading: GoalProgressLoadingState;
  private _error: GoalProgressErrorState | null = null;
  private _reachedMilestoneIds: readonly string[] = Object.freeze([]);

  constructor(deps: GoalProgressExperienceViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this.now = deps.now ?? (() => new Date());
    this._loading = createGoalProgressLoadingState(
      this.service
        ? GoalProgressLoadingStatuses.IDLE
        : GoalProgressLoadingStatuses.LOADING,
    );
  }

  /** True when the ViewModel is driven by hydrated workspace instead of GoalProgressExperienceService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
  }

  get dashboard(): GoalProgressDashboard | null {
    return this._dashboard;
  }
  get loading(): GoalProgressLoadingState {
    return this._loading;
  }
  get error(): GoalProgressErrorState | null {
    return this._error;
  }
  get isEmpty(): boolean {
    return !!this._dashboard && !this._dashboard.goalId;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadDashboard(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await loadGoalProgressDashboard({ service: this.service });
    } catch (caught) {
      this._dashboard = null;
      this._error = this.toErrorState(caught);
    }
    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await refreshGoalProgressDashboard({ service: this.service });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.IDLE);
    this.notify();
  }

  /** Applies a dashboard projected from hydrated Unified Workspace output. */
  applyHydratedGoalProgress(dashboard: GoalProgressDashboard): void {
    this._dashboard = dashboard;
    this._reachedMilestoneIds = Object.freeze(
      dashboard.milestones.filter((item) => item.reached).map((item) => item.id),
    );
    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies hydrated workspace output (runtime production refresh path). */
  refreshFromHydratedGoalProgress(dashboard: GoalProgressDashboard | null): void {
    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (dashboard) {
      this.applyHydratedGoalProgress(dashboard);
      return;
    }

    this._dashboard = null;
    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.IDLE);
    this._error = createGoalProgressErrorState(
      "Goal Progress runtime unavailable.",
      "goal_progress_runtime_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable hydrated goal progress output to the Goal Progress UI. */
  applyGoalProgressFailure(message: string): void {
    this._dashboard = null;
    this._loading = createGoalProgressLoadingState(GoalProgressLoadingStatuses.IDLE);
    this._error = createGoalProgressErrorState(message, "goal_progress_runtime_unavailable");
    this.notify();
  }

  async updateProgress(): Promise<void> {
    if (!this._dashboard || !this._dashboard.updateAvailable) {
      return;
    }

    if (this.service) {
      try {
        const dto = await this.service.updateProgress();
        this._dashboard = mapGoalProgressDashboard(dto);
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

    const evaluatedAt = this.now().toISOString();
    const result = updateRuntimeGoalProgress({
      dashboard: this._dashboard,
      athleteId: this.athleteId,
      evaluatedAt,
      reachedMilestoneIds: this._reachedMilestoneIds,
    });

    if (!result.progress) {
      return;
    }

    this._dashboard = result.dashboard;
    this._error = null;
    this.notify();

    try {
      await publishGoalRuntimeProgressUpdated({
        dashboard: result.dashboard,
        progress: result.progress,
        athleteId: this.athleteId,
        updatedAt: evaluatedAt,
      });
    } catch (caught) {
      this._error = this.toErrorState(caught);
      this.notify();
    }
  }

  async completeMilestone(milestoneId: string): Promise<void> {
    if (!this._dashboard) {
      return;
    }

    if (this.service) {
      try {
        const dto = await this.service.completeMilestone(milestoneId);
        this._dashboard = mapGoalProgressDashboard(dto);
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

    const occurredAt = this.now().toISOString();
    const result = completeRuntimeMilestone({
      dashboard: this._dashboard,
      athleteId: this.athleteId,
      milestoneId,
      reachedMilestoneIds: this._reachedMilestoneIds,
    });

    if (!result.milestone) {
      return;
    }

    this._dashboard = result.dashboard;
    this._reachedMilestoneIds = Object.freeze([
      ...new Set([...this._reachedMilestoneIds, milestoneId]),
    ]);
    this._error = null;
    this.notify();

    try {
      await publishGoalRuntimeMilestoneProgress({
        dashboard: result.dashboard,
        milestone: result.milestone,
        athleteId: this.athleteId,
        occurredAt,
      });
    } catch (caught) {
      this._error = this.toErrorState(caught);
      this.notify();
    }
  }

  async completeGoal(): Promise<void> {
    if (!this._dashboard || !this._dashboard.completeAvailable) {
      return;
    }

    if (this.service) {
      try {
        const dto = await this.service.completeGoal();
        this._dashboard = mapGoalProgressDashboard(dto);
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

    const completedAt = this.now().toISOString();
    const result = completeRuntimeGoal({
      dashboard: this._dashboard,
      athleteId: this.athleteId,
      completedAt,
      reachedMilestoneIds: this._reachedMilestoneIds,
    });

    if (!result.snapshot) {
      return;
    }

    this._dashboard = result.dashboard;
    this._error = null;
    this.notify();

    try {
      await publishGoalRuntimeCompletionProgress({
        dashboard: result.dashboard,
        snapshot: result.snapshot,
        athleteId: this.athleteId,
        completedAt,
      });
    } catch (caught) {
      this._error = this.toErrorState(caught);
      this.notify();
    }
  }

  private toErrorState(caught: unknown): GoalProgressErrorState {
    if (caught instanceof GoalProgressExperienceError) {
      return createGoalProgressErrorState(
        caught.message,
        "goal_progress_experience_service_error",
        true,
      );
    }
    if (caught instanceof Error) {
      return createGoalProgressErrorState(caught.message);
    }
    return createGoalProgressErrorState("Failed to load Goal Progress experience.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
