import {
  loadProfile,
  refreshProfile,
  updateAppearancePreferences,
  updateCoachPreferences,
  updateGoals,
  updateMeasurementUnits,
  updateNotificationPreferences,
  updateNutritionPreferences,
  updateTrainingPreferences,
} from "../application";
import {
  createProfileErrorState,
  createProfileLoadingState,
  createProfileSavingState,
  ProfileLoadingStatuses,
  ProfileSavingStatuses,
  type AthleteProfile,
  type ProfileErrorState,
  type ProfileLoadingState,
  type ProfileSavingState,
} from "../models";
import {
  profileExperienceService,
  ProfileExperienceError,
  type AppearancePreferencesDto,
  type AthleteGoalDto,
  type CoachPreferencesDto,
  type MeasurementUnitsDto,
  type NotificationPreferencesDto,
  type NutritionPreferencesDto,
  type ProfileExperienceService,
  type TrainingPreferencesDto,
} from "../services";

export interface ProfileExperienceViewModelDeps {
  readonly service?: ProfileExperienceService;
}

export class ProfileExperienceViewModel {
  private readonly service: ProfileExperienceService;
  private readonly listeners = new Set<() => void>();
  private _profile: AthleteProfile | null = null;
  private _loading: ProfileLoadingState = createProfileLoadingState(ProfileLoadingStatuses.IDLE);
  private _saving: ProfileSavingState = createProfileSavingState(ProfileSavingStatuses.IDLE);
  private _error: ProfileErrorState | null = null;

  constructor(deps: ProfileExperienceViewModelDeps = {}) {
    this.service = deps.service ?? profileExperienceService;
  }

  get profile(): AthleteProfile | null { return this._profile; }
  get loading(): ProfileLoadingState { return this._loading; }
  get saving(): ProfileSavingState { return this._saving; }
  get error(): ProfileErrorState | null { return this._error; }
  get isEmpty(): boolean {
    return !!this._profile &&
      this._profile.goals.length === 0 &&
      !this._profile.age &&
      !this._profile.heightCm &&
      !this._profile.weightKg;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadProfile(): Promise<void> {
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.LOADING);
    this._error = null;
    this.notify();
    try {
      this._profile = await loadProfile({ service: this.service });
    } catch (caught) {
      this._profile = null;
      this._error = this.toErrorState(caught);
    }
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.IDLE);
    this.notify();
  }

  async refresh(): Promise<void> {
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();
    try {
      this._profile = await refreshProfile({ service: this.service });
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.IDLE);
    this.notify();
  }

  async updateUnits(units: MeasurementUnitsDto): Promise<void> {
    await this.save(() => updateMeasurementUnits({ service: this.service, units }));
  }

  async updateTheme(prefs: AppearancePreferencesDto): Promise<void> {
    await this.save(() => updateAppearancePreferences({ service: this.service, prefs }));
  }

  async updateNotifications(prefs: NotificationPreferencesDto): Promise<void> {
    await this.save(() => updateNotificationPreferences({ service: this.service, prefs }));
  }

  async updateTrainingPreferences(prefs: TrainingPreferencesDto): Promise<void> {
    await this.save(() => updateTrainingPreferences({ service: this.service, prefs }));
  }

  async updateNutritionPreferences(prefs: NutritionPreferencesDto): Promise<void> {
    await this.save(() => updateNutritionPreferences({ service: this.service, prefs }));
  }

  async updateGoals(goals: readonly AthleteGoalDto[]): Promise<void> {
    await this.save(() => updateGoals({ service: this.service, goals }));
  }

  async updateCoachPreferences(prefs: CoachPreferencesDto): Promise<void> {
    await this.save(() => updateCoachPreferences({ service: this.service, prefs }));
  }

  private async save(action: () => Promise<AthleteProfile>): Promise<void> {
    this._saving = createProfileSavingState(ProfileSavingStatuses.SAVING);
    this._error = null;
    this.notify();
    try {
      this._profile = await action();
    } catch (caught) {
      this._error = this.toErrorState(caught);
    }
    this._saving = createProfileSavingState(ProfileSavingStatuses.IDLE);
    this.notify();
  }

  private toErrorState(caught: unknown): ProfileErrorState {
    if (caught instanceof ProfileExperienceError) {
      return createProfileErrorState(caught.message, "profile_experience_service_error", true);
    }
    if (caught instanceof Error) {
      return createProfileErrorState(caught.message);
    }
    return createProfileErrorState("Failed to load Profile experience.");
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
