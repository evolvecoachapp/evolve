import {
  createAppearancePreferences,
  createAthleteGoal,
  createAthleteProfile,
  createCoachPreferences,
  createConnectedServiceEntry,
  createConnectedServices,
  createMeasurementUnits,
  createNotificationPreferences,
  createNutritionPreferences,
  createProfileSection,
  createTrainingPreferences,
  type AthleteProfile,
} from "../models";
import type { AthleteProfileDto } from "../services";

export function mapAthleteProfile(dto: AthleteProfileDto): AthleteProfile {
  return createAthleteProfile({
    id: dto.id,
    displayName: dto.displayName,
    email: dto.email,
    avatarUrl: dto.avatarUrl,
    joinDate: dto.joinDate,
    bio: dto.bio,
    age: dto.age,
    heightCm: dto.heightCm,
    weightKg: dto.weightKg,
    firstName: dto.firstName ?? null,
    lastName: dto.lastName ?? null,
    gender: dto.gender ?? null,
    birthDate: dto.birthDate ?? null,
    targetWeightKg: dto.targetWeightKg ?? null,
    primaryGoal: dto.primaryGoal ?? null,
    activityLevel: dto.activityLevel ?? null,
    goals: dto.goals.map((g) =>
      createAthleteGoal({
        ...g,
        destination: g.destination ?? `/(app)/profile/goal/${g.id}`,
      }),
    ),
    trainingPreferences: createTrainingPreferences({
      ...dto.trainingPreferences,
      destination: dto.trainingPreferences.destination ?? "/(app)/profile/training-preferences",
    }),
    nutritionPreferences: createNutritionPreferences({
      ...dto.nutritionPreferences,
      destination: dto.nutritionPreferences.destination ?? "/(app)/profile/nutrition-preferences",
    }),
    coachPreferences: createCoachPreferences({
      ...dto.coachPreferences,
      destination: dto.coachPreferences.destination ?? "/(app)/profile/coach-preferences",
    }),
    notificationPreferences: createNotificationPreferences({
      ...dto.notificationPreferences,
      destination: dto.notificationPreferences.destination ?? "/(app)/profile/notification-preferences",
    }),
    appearancePreferences: createAppearancePreferences({
      ...dto.appearancePreferences,
      destination: dto.appearancePreferences.destination ?? "/(app)/profile/appearance",
    }),
    measurementUnits: createMeasurementUnits(dto.measurementUnits),
    connectedServices: createConnectedServices({
      services: dto.connectedServices.map((s) =>
        createConnectedServiceEntry({
          ...s,
          destination: s.destination ?? `/(app)/profile/service/${s.kind}`,
        }),
      ),
    }),
    sections: dto.sections.map((s) =>
      createProfileSection({
        ...s,
        destination: s.destination ?? null,
      }),
    ),
    accountStatus: dto.accountStatus,
    appVersion: dto.appVersion,
    editProfileDestination: dto.editProfileDestination ?? "/(app)/profile/edit",
    privacyDestination: dto.privacyDestination ?? "/(app)/profile/privacy",
    aboutDestination: dto.aboutDestination ?? "/(app)/profile/about",
  });
}
