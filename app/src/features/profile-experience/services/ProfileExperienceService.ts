import type { AppearancePreferences } from "../models/AppearancePreferences";
import type { AthleteGoal, GoalKind } from "../models/AthleteGoal";
import type { CoachPreferences } from "../models/CoachPreferences";
import type { MeasurementUnits } from "../models/MeasurementUnits";
import type { NotificationPreferences } from "../models/NotificationPreferences";
import type { NutritionPreferences } from "../models/NutritionPreferences";
import type { ProfileSection } from "../models/ProfileSection";
import type { TrainingPreferences } from "../models/TrainingPreferences";
import type { ConnectedServiceEntry } from "../models/ConnectedServices";

export interface AthleteGoalDto {
  readonly id: string;
  readonly kind: GoalKind;
  readonly title: string;
  readonly description: string;
  readonly targetDate: string | null;
  readonly progress: number;
  readonly isPrimary: boolean;
  readonly destination?: string | null;
}

export interface TrainingPreferencesDto {
  readonly level: TrainingPreferences["level"];
  readonly sessionsPerWeek: number;
  readonly preferredDuration: number;
  readonly preferredTime: string;
  readonly focusAreas: readonly string[];
  readonly equipmentAvailable: readonly string[];
  readonly destination?: string | null;
}

export interface NutritionPreferencesDto {
  readonly dietaryApproach: NutritionPreferences["dietaryApproach"];
  readonly calorieTarget: number;
  readonly mealsPerDay: number;
  readonly allergies: readonly string[];
  readonly supplements: readonly string[];
  readonly destination?: string | null;
}

export interface CoachPreferencesDto {
  readonly coachingStyle: CoachPreferences["coachingStyle"];
  readonly motivationLevel: CoachPreferences["motivationLevel"];
  readonly feedbackFrequency: CoachPreferences["feedbackFrequency"];
  readonly explanationDepth: CoachPreferences["explanationDepth"];
  readonly destination?: string | null;
}

export interface NotificationPreferencesDto {
  readonly workoutReminders: boolean;
  readonly mealReminders: boolean;
  readonly hydrationReminders: boolean;
  readonly coachMessages: boolean;
  readonly progressUpdates: boolean;
  readonly destination?: string | null;
}

export interface AppearancePreferencesDto {
  readonly theme: AppearancePreferences["theme"];
  readonly accentColor: string | null;
  readonly destination?: string | null;
}

export interface MeasurementUnitsDto {
  readonly weight: MeasurementUnits["weight"];
  readonly distance: MeasurementUnits["distance"];
  readonly height: MeasurementUnits["height"];
}

export interface ConnectedServiceEntryDto {
  readonly kind: ConnectedServiceEntry["kind"];
  readonly label: string;
  readonly isConnected: boolean;
  readonly lastSyncLabel: string | null;
  readonly destination?: string | null;
}

export interface ProfileSectionDto {
  readonly kind: ProfileSection["kind"];
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly destination?: string | null;
}

export interface AthleteProfileDto {
  readonly id: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly avatarUrl: string | null;
  readonly joinDate: string;
  readonly bio: string;
  readonly age: number | null;
  readonly heightCm: number | null;
  readonly weightKg: number | null;
  readonly goals: readonly AthleteGoalDto[];
  readonly trainingPreferences: TrainingPreferencesDto;
  readonly nutritionPreferences: NutritionPreferencesDto;
  readonly coachPreferences: CoachPreferencesDto;
  readonly notificationPreferences: NotificationPreferencesDto;
  readonly appearancePreferences: AppearancePreferencesDto;
  readonly measurementUnits: MeasurementUnitsDto;
  readonly connectedServices: readonly ConnectedServiceEntryDto[];
  readonly sections: readonly ProfileSectionDto[];
  readonly accountStatus: string;
  readonly appVersion: string;
  readonly editProfileDestination?: string | null;
  readonly privacyDestination?: string | null;
  readonly aboutDestination?: string | null;
}

export type ProfileExperienceProviderId = "mock" | "backend" | "local";

export interface ProfileExperienceService {
  readonly providerId: ProfileExperienceProviderId;
  getProfile(): Promise<AthleteProfileDto>;
  updateTrainingPreferences(prefs: TrainingPreferencesDto): Promise<AthleteProfileDto>;
  updateNutritionPreferences(prefs: NutritionPreferencesDto): Promise<AthleteProfileDto>;
  updateCoachPreferences(prefs: CoachPreferencesDto): Promise<AthleteProfileDto>;
  updateNotificationPreferences(prefs: NotificationPreferencesDto): Promise<AthleteProfileDto>;
  updateAppearancePreferences(prefs: AppearancePreferencesDto): Promise<AthleteProfileDto>;
  updateMeasurementUnits(units: MeasurementUnitsDto): Promise<AthleteProfileDto>;
  updateGoals(goals: readonly AthleteGoalDto[]): Promise<AthleteProfileDto>;
}

export class ProfileExperienceError extends Error {
  constructor(message: string, readonly providerId?: ProfileExperienceProviderId) {
    super(message);
    this.name = "ProfileExperienceError";
  }
}
