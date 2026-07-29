import {
  changeNutritionDay,
  loadCoachSuggestions,
  loadHydration,
  loadMacros,
  loadMeals,
  loadNutritionDashboard,
  refreshNutritionDashboard,
  toggleMealCompletion,
} from "../application";
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
  nutritionExperienceService,
  NutritionExperienceError,
  type NutritionExperienceService,
} from "../services";

export interface NutritionExperienceViewModelDeps {
  readonly service?: NutritionExperienceService;
  readonly initialDay?: NutritionDay;
}

const TODAY = createNutritionDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

export class NutritionExperienceViewModel {
  private readonly service: NutritionExperienceService;
  private readonly listeners = new Set<() => void>();
  private _dashboard: NutritionDashboard | null = null;
  private _loading: NutritionLoadingState = createNutritionLoadingState(NutritionLoadingStatuses.IDLE);
  private _error: NutritionErrorState | null = null;
  private _day: NutritionDay;

  constructor(deps: NutritionExperienceViewModelDeps = {}) {
    this.service = deps.service ?? nutritionExperienceService;
    this._day = deps.initialDay ?? TODAY;
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

  async loadMeals(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const meals = await loadMeals({ service: this.service, day: this._day });
      this._dashboard = Object.freeze({ ...this._dashboard, meals });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadMacros(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const macros = await loadMacros({ service: this.service, day: this._day });
      this._dashboard = Object.freeze({ ...this._dashboard, macros });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadHydration(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const hydration = await loadHydration({ service: this.service, day: this._day });
      this._dashboard = Object.freeze({ ...this._dashboard, hydration });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async loadCoachSuggestions(): Promise<void> {
    if (!this._dashboard) return;
    try {
      const coachSuggestions = await loadCoachSuggestions({ service: this.service, day: this._day });
      this._dashboard = Object.freeze({ ...this._dashboard, coachSuggestions });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this.notify();
  }

  async toggleMealCompletion(mealId: string): Promise<void> {
    if (!this._dashboard) return;
    try {
      await toggleMealCompletion({ service: this.service, day: this._day, mealId });
      this._dashboard = await loadNutritionDashboard({ service: this.service, day: this._day });
      this.notify();
    } catch (caught) {
      this._error = this.toErrorState(caught);
      this.notify();
    }
  }

  async changeDay(day: NutritionDay): Promise<void> {
    this._day = changeNutritionDay({ day });
    await this.loadDashboard();
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
