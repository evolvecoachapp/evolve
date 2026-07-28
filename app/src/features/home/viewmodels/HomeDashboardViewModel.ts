import {
  loadHomeDashboard,
  refreshHomeDashboard,
} from "../application";
import type { AthleteIdentityInput } from "../mappers";
import type { AthleteSnapshotCard } from "../models/AthleteSnapshotCard";
import type { HomeDashboard } from "../models/HomeDashboard";
import {
  createHomeErrorState,
  type HomeErrorState,
} from "../models/HomeErrorState";
import {
  createHomeLoadingState,
  HomeLoadingStatuses,
  type HomeLoadingState,
} from "../models/HomeLoadingState";
import type { QuickAction } from "../models/QuickAction";
import { homeService, type HomeService, HomeServiceError } from "../services";

export interface HomeDashboardViewModelDeps {
  readonly service?: HomeService;
  readonly identity: AthleteIdentityInput;
}

/**
 * Home dashboard ViewModel — application orchestration only.
 * No UI code.
 */
export class HomeDashboardViewModel {
  private readonly service: HomeService;
  private identity: AthleteIdentityInput;
  private readonly listeners = new Set<() => void>();

  private _dashboard: HomeDashboard | null = null;
  private _athlete: AthleteSnapshotCard | null = null;
  private _quickActions: readonly QuickAction[] = Object.freeze([]);
  private _loading: HomeLoadingState = createHomeLoadingState(
    HomeLoadingStatuses.IDLE,
  );
  private _error: HomeErrorState | null = null;

  constructor(deps: HomeDashboardViewModelDeps) {
    this.service = deps.service ?? homeService;
    this.identity = deps.identity;
  }

  get dashboard(): HomeDashboard | null {
    return this._dashboard;
  }

  get athlete(): AthleteSnapshotCard | null {
    return this._athlete;
  }

  get workout() {
    return this._dashboard?.workout ?? null;
  }

  get nutrition() {
    return this._dashboard?.nutrition ?? null;
  }

  get recovery() {
    return this._dashboard?.recovery ?? null;
  }

  get coach() {
    return this._dashboard?.coach ?? null;
  }

  get quickActions(): readonly QuickAction[] {
    return this._quickActions;
  }

  get loading(): HomeLoadingState {
    return this._loading;
  }

  get error(): HomeErrorState | null {
    return this._error;
  }

  get isEmpty(): boolean {
    return this._dashboard?.isEmpty === true;
  }

  setIdentity(identity: AthleteIdentityInput): void {
    this.identity = identity;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async load(): Promise<void> {
    this._loading = createHomeLoadingState(HomeLoadingStatuses.LOADING);
    this._error = null;
    this.notify();

    try {
      const dashboard = await loadHomeDashboard({
        service: this.service,
        identity: this.identity,
      });
      this.applyDashboard(dashboard);
    } catch (caught: unknown) {
      this._dashboard = null;
      this._athlete = null;
      this._quickActions = Object.freeze([]);
      this._loading = createHomeLoadingState(HomeLoadingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  async refresh(): Promise<void> {
    this._loading = createHomeLoadingState(HomeLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    try {
      const dashboard = await refreshHomeDashboard({
        service: this.service,
        identity: this.identity,
      });
      this.applyDashboard(dashboard);
    } catch (caught: unknown) {
      this._loading = createHomeLoadingState(HomeLoadingStatuses.IDLE);
      this._error = this.toErrorState(caught);
    }

    this.notify();
  }

  private applyDashboard(dashboard: HomeDashboard): void {
    this._dashboard = dashboard;
    this._athlete = dashboard.athlete;
    this._quickActions = dashboard.quickActions;
    this._loading = createHomeLoadingState(HomeLoadingStatuses.IDLE);
    this._error = null;
  }

  private toErrorState(caught: unknown): HomeErrorState {
    if (caught instanceof HomeServiceError) {
      return createHomeErrorState(caught.message, "home_service_error", true);
    }
    if (caught instanceof Error) {
      return createHomeErrorState(caught.message);
    }
    return createHomeErrorState("Failed to load Home dashboard.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
