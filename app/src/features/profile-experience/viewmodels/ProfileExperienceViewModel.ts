import {
  loadProfile,
  refreshProfile,
  updateAppearancePreferences,
  updateAthleteInfo,
  updateCoachPreferences,
  updateGoals,
  updateMeasurementUnits,
  updateNotificationPreferences,
  updateNutritionPreferences,
  updateTrainingPreferences,
} from "../application";
import { isAthleteSetupComplete } from "../../athlete-setup/isBackendProfileComplete";
import {
  createAthleteProfile,
  createProfileErrorState,
  createProfileLoadingState,
  createProfileSavingState,
  ProfileLoadingStatuses,
  ProfileSavingStatuses,
  type AthleteProfile,
  type AthleteProfileInput,
  type ProfileErrorState,
  type ProfileLoadingState,
  type ProfileSavingState,
} from "../models";
import {
  ProfileExperienceError,
  type AppearancePreferencesDto,
  type AthleteGoalDto,
  type AthleteInfoUpdateDto,
  type CoachPreferencesDto,
  type MeasurementUnitsDto,
  type NotificationPreferencesDto,
  type NutritionPreferencesDto,
  type ProfileExperienceService,
  type TrainingPreferencesDto,
} from "../services";

export interface ProfileExperienceViewModelDeps {
  readonly service?: ProfileExperienceService;
  readonly athleteId?: string;
}

/**
 * Profile Experience ViewModel — application orchestration only.
 * Production path applies hydrated Athlete Identity via applyHydratedProfile().
 */
export class ProfileExperienceViewModel {
  private readonly service: ProfileExperienceService | null;
  private readonly athleteId: string | null;
  private readonly listeners = new Set<() => void>();
  private _profile: AthleteProfile | null = null;
  private _loading: ProfileLoadingState;
  private _saving: ProfileSavingState = createProfileSavingState(ProfileSavingStatuses.IDLE);
  private _error: ProfileErrorState | null = null;

  constructor(deps: ProfileExperienceViewModelDeps = {}) {
    this.service = deps.service ?? null;
    this.athleteId = deps.athleteId ?? null;
    this._loading = createProfileLoadingState(
      this.service
        ? ProfileLoadingStatuses.IDLE
        : ProfileLoadingStatuses.LOADING,
    );
  }

  /** True when the ViewModel is driven by hydrated Athlete Identity instead of ProfileExperienceService. */
  get isRuntimeDriven(): boolean {
    return this.service === null;
  }

  get profile(): AthleteProfile | null { return this._profile; }
  get loading(): ProfileLoadingState { return this._loading; }
  get saving(): ProfileSavingState { return this._saving; }
  get error(): ProfileErrorState | null { return this._error; }
  get isEmpty(): boolean {
    if (!this._profile) {
      return false;
    }
    if (isAthleteSetupComplete(this._profile)) {
      return false;
    }
    return (
      this._profile.goals.length === 0 &&
      !this._profile.age &&
      !this._profile.heightCm &&
      !this._profile.weightKg
    );
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadProfile(): Promise<void> {
    if (!this.service) {
      return;
    }

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
    if (!this.service) {
      return;
    }

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

  /** Applies a profile projected from hydrated Athlete Identity. */
  applyHydratedProfile(profile: AthleteProfileInput): void {
    this._profile = createAthleteProfile(profile);
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.IDLE);
    this._error = null;
    this.notify();
  }

  /** Re-applies hydrated identity (runtime production refresh path). */
  refreshFromHydratedProfile(profile: AthleteProfile | null): void {
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.REFRESHING);
    this._error = null;
    this.notify();

    if (profile) {
      this.applyHydratedProfile(profile);
      return;
    }

    this._profile = null;
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.IDLE);
    this._error = createProfileErrorState(
      "Athlete identity unavailable.",
      "athlete_identity_unavailable",
    );
    this.notify();
  }

  /** Surfaces missing or unavailable hydrated identity to the Profile UI. */
  applyIdentityFailure(message: string): void {
    this._profile = null;
    this._loading = createProfileLoadingState(ProfileLoadingStatuses.IDLE);
    this._error = createProfileErrorState(message, "athlete_identity_unavailable");
    this.notify();
  }

  async updateUnits(units: MeasurementUnitsDto): Promise<void> {
    await this.save((athleteId) =>
      updateMeasurementUnits({ service: this.service ?? undefined, athleteId, units }),
    );
  }

  async updateTheme(prefs: AppearancePreferencesDto): Promise<void> {
    await this.save((athleteId) =>
      updateAppearancePreferences({ service: this.service ?? undefined, athleteId, prefs }),
    );
  }

  async updateNotifications(prefs: NotificationPreferencesDto): Promise<void> {
    await this.save((athleteId) =>
      updateNotificationPreferences({ service: this.service ?? undefined, athleteId, prefs }),
    );
  }

  async updateTrainingPreferences(prefs: TrainingPreferencesDto): Promise<void> {
    await this.save((athleteId) =>
      updateTrainingPreferences({ service: this.service ?? undefined, athleteId, prefs }),
    );
  }

  async updateNutritionPreferences(prefs: NutritionPreferencesDto): Promise<void> {
    await this.save((athleteId) =>
      updateNutritionPreferences({ service: this.service ?? undefined, athleteId, prefs }),
    );
  }

  async updateGoals(goals: readonly AthleteGoalDto[]): Promise<void> {
    await this.save((athleteId) =>
      updateGoals({ service: this.service ?? undefined, athleteId, goals }),
    );
  }

  async updateCoachPreferences(prefs: CoachPreferencesDto): Promise<void> {
    await this.save((athleteId) =>
      updateCoachPreferences({ service: this.service ?? undefined, athleteId, prefs }),
    );
  }

  /** Persists height/weight — the only Athlete Card fields the backend owns (`PATCH /api/v1/users/me`). */
  async updateAthleteInfo(input: AthleteInfoUpdateDto): Promise<void> {
    await this.save((athleteId) =>
      updateAthleteInfo({ service: this.service ?? undefined, athleteId, input }),
    );
  }

  private async save(
    action: (athleteId: string | undefined) => Promise<AthleteProfile>,
  ): Promise<void> {
    if (!this.service && !this.athleteId) {
      this._error = createProfileErrorState(
        "Profile updates are not available in the runtime path.",
        "profile_update_unavailable",
        false,
      );
      this.notify();
      return;
    }

    this._saving = createProfileSavingState(ProfileSavingStatuses.SAVING);
    this._error = null;
    this.notify();
    try {
      this._profile = await action(this.athleteId ?? undefined);
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
