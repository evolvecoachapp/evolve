import {
  changeNutritionDay,
  loadCoachSuggestions,
  loadHydration,
  loadHydratedNutritionExperience,
  loadMacros,
  loadMeals,
  loadNutritionDashboard,
  logRuntimeHydration,
  refreshNutritionDashboard,
  toggleMealCompletion,
  toggleRuntimeMealCompletion,
} from "../application";
import {
  publishNutritionRuntimeDailyCompletion,
  publishNutritionRuntimeHydrationProgress,
  publishNutritionRuntimeMealProgress,
} from "../application/publishNutritionRuntimeProgress";
import {
  createNutritionErrorState,
  createNutritionLoadingState,
  NutritionLoadingStatuses,
  createNutritionDay,
  type HydrationProgress,
  type MacroProgress,
  type Meal,
  type NutritionCoachSuggestion,
  type NutritionDashboard,
  type NutritionDay,
  type NutritionErrorState,
  type NutritionLoadingState,
} from "../models";
import {
  NutritionExperienceError,
  type NutritionExperienceService,
} from "../services";

export interface NutritionExperienceViewModelDeps {
  readonly service?: NutritionExperienceService;
  readonly athleteId?: string;
  readonly initialDay?: NutritionDay;
  readonly now?: () => Date;
}

const TODAY = createNutritionDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

/**
 * Nutrition Experience ViewModel — application orchestration only.
 * Production path applies hydrated Unified Workspace via applyHydratedDashboard().
 */
export class NutritionExperienceViewModel {
  private readonly service: NutritionExperienceService | null;
  private readonly athleteId: string | null;
  private readonly now: () => Date;
  private readonly listeners = new Set<() => void>();
  private _dashboard: NutritionDashboard | null = null;
  private _loading: NutritionLoadingState;
  private _error: NutritionErrorState | null = null;
  private _day: NutritionDay;
  private readonly toggledMealIds = new Map<string, Set<string>>();
  private _hydrationMl = 0;

  constructor(deps: NutritionExperienceViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this.now = deps.now ?? (() => new Date());
    this._day = deps.initialDay ?? TODAY;
    this._loading = createNutritionLoadingState(
      this.service
        ? NutritionLoadingStatuses.IDLE
        : NutritionLoadingStatuses.LOADING,
    );
  }

  /** True when the ViewModel is driven by hydrated workspace instead of NutritionExperienceService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
  }

  get dashboard(): NutritionDashboard | null { return this._dashboard; }
  get loading(): NutritionLoadingState { return this._loading; }
  get error(): NutritionErrorState | null { return this._error; }
  get day(): NutritionDay { return this._day; }
  get meals(): readonly Meal[] { return this._dashboard?.meals ?? Object.freeze([]); }
  get macros(): MacroProgress | null { return this._dashboard?.macros ?? null; }
  get hydration(): HydrationProgress | null { return this._dashboard?.hydration ?? null; }
  get coachSuggestions(): readonly NutritionCoachSuggestion[] { return this._dashboard?.coachSuggestions ?? Object.freeze([]); }
  get availableDays(): readonly NutritionDay[] { return this._dashboard?.availableDays ?? Object.freeze([this._day]); }
  get isEmpty(): boolean {
    return !!this._dashboard &&
      this._dashboard.meals.length === 0 &&
      this._dashboard.coachSuggestions.length === 0 &&
      this._dashboard.nutritionScore === 0;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadDashboard(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await loadNutritionDashboard({ service: this.service, day: this._day });
    } catch (caught) {
      this._dashboard = null;
      this._error = this.toErrorState(caught);
    }
    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(): Promise<void> {
    if (!this.service) {
      return;
    }

    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this._dashboard = await refreshNutritionDashboard({ service: this.service, day: this._day });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.IDLE);
    this.notify();
  }

  /** Applies a dashboard projected from hydrated Unified Workspace output. */
  applyHydratedDashboard(dashboard: NutritionDashboard): void {
    this._dashboard = dashboard;
    this._hydrationMl = dashboard.hydration.currentMl;
    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies hydrated workspace output (runtime production refresh path). */
  refreshFromHydratedDashboard(dashboard: NutritionDashboard | null): void {
    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (dashboard) {
      this.applyHydratedDashboard(dashboard);
      return;
    }

    this._dashboard = null;
    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.IDLE);
    this._error = createNutritionErrorState(
      "Nutrition runtime unavailable.",
      "nutrition_runtime_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable hydrated nutrition output to the Nutrition UI. */
  applyNutritionFailure(message: string): void {
    this._dashboard = null;
    this._loading = createNutritionLoadingState(NutritionLoadingStatuses.IDLE);
    this._error = createNutritionErrorState(message, "nutrition_runtime_unavailable");
    this.notify();
  }

  async loadMeals(): Promise<void> {
    if (!this._dashboard) return;
    if (this.service) {
      try {
        const meals = await loadMeals({ service: this.service, day: this._day });
        this._dashboard = Object.freeze({ ...this._dashboard, meals });
      } catch (caught) {
        this._error = this.toErrorState(caught);
      }
      this.notify();
      return;
    }

    this.notify();
  }

  async loadMacros(): Promise<void> {
    if (!this._dashboard) return;
    if (this.service) {
      try {
        const macros = await loadMacros({ service: this.service, day: this._day });
        this._dashboard = Object.freeze({ ...this._dashboard, macros });
      } catch (caught) {
        this._error = this.toErrorState(caught);
      }
      this.notify();
      return;
    }

    this.notify();
  }

  async loadHydration(): Promise<void> {
    if (!this._dashboard) return;
    if (this.service) {
      try {
        const hydration = await loadHydration({ service: this.service, day: this._day });
        this._dashboard = Object.freeze({ ...this._dashboard, hydration });
      } catch (caught) {
        this._error = this.toErrorState(caught);
      }
      this.notify();
      return;
    }

    this.notify();
  }

  async loadCoachSuggestions(): Promise<void> {
    if (!this._dashboard) return;
    if (this.service) {
      try {
        const coachSuggestions = await loadCoachSuggestions({
          service: this.service,
          day: this._day,
        });
        this._dashboard = Object.freeze({ ...this._dashboard, coachSuggestions });
      } catch (caught) {
        this._error = this.toErrorState(caught);
      }
      this.notify();
      return;
    }

    this.notify();
  }

  async toggleMealCompletion(mealId: string): Promise<void> {
    if (!this._dashboard) return;

    if (this.service) {
      try {
        await toggleMealCompletion({ service: this.service, day: this._day, mealId });
        this._dashboard = await loadNutritionDashboard({ service: this.service, day: this._day });
        this.notify();
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
      return;
    }

    const toggled = this.toggledMealIds.get(this._day.isoDate) ?? new Set<string>();
    const result = toggleRuntimeMealCompletion({
      dashboard: this._dashboard,
      mealId,
    });

    if (!result.meal) {
      return;
    }

    const nextToggled = new Set(toggled);
    if (result.completed) {
      nextToggled.add(mealId);
    } else {
      nextToggled.delete(mealId);
    }
    this.toggledMealIds.set(this._day.isoDate, nextToggled);
    this._dashboard = result.dashboard;
    this._error = null;
    this.notify();

    if (this.athleteId) {
      const completedAt = this.now().toISOString();
      try {
        await publishNutritionRuntimeMealProgress({
          dashboard: result.dashboard,
          meal: result.meal,
          completed: result.completed,
          athleteId: this.athleteId,
          completedAt,
        });
        await publishNutritionRuntimeDailyCompletion({
          dashboard: result.dashboard,
          athleteId: this.athleteId,
          completedAt,
        });
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
    }
  }

  async logHydration(amountMl: number): Promise<void> {
    if (!this._dashboard || amountMl <= 0) {
      return;
    }

    if (this.service) {
      this._error = createNutritionErrorState(
        "Hydration logging is unavailable for the experience provider.",
        "nutrition_hydration_unavailable",
        false,
      );
      this.notify();
      return;
    }

    this._dashboard = logRuntimeHydration({
      dashboard: this._dashboard,
      amountMl,
    });
    this._hydrationMl = this._dashboard.hydration.currentMl;
    this._error = null;
    this.notify();

    if (this.athleteId) {
      const loggedAt = this.now().toISOString();
      try {
        await publishNutritionRuntimeHydrationProgress({
          dashboard: this._dashboard,
          athleteId: this.athleteId,
          loggedAt,
        });
      } catch (caught) {
        this._error = this.toErrorState(caught);
        this.notify();
      }
    }
  }

  async changeDay(day: NutritionDay): Promise<void> {
    this._day = changeNutritionDay({ day });
    if (this.service) {
      await this.loadDashboard();
      return;
    }

    if (!this.athleteId) {
      this.applyNutritionFailure("Nutrition runtime unavailable.");
      return;
    }

    const dashboard = await loadHydratedNutritionExperience({
      athleteId: this.athleteId,
      day: this._day,
      toggledMealIds: this.toggledMealIds.get(this._day.isoDate),
      hydrationMl: this._hydrationMl,
    });
    this.refreshFromHydratedDashboard(dashboard);
  }

  private toErrorState(caught: unknown): NutritionErrorState {
    if (caught instanceof NutritionExperienceError) {
      return createNutritionErrorState(caught.message, "nutrition_experience_service_error", true);
    }
    if (caught instanceof Error) {
      return createNutritionErrorState(caught.message);
    }
    return createNutritionErrorState("Failed to load Nutrition experience.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
