import {
  UserIntelligence,
  Goal,
  Training,
  Lifestyle,
  Nutrition,
  Health,
  Equipment,
  Preferences,
  AIPreferences,
} from './types'

export const defaultGoals = (): Goal => ({
  primaryGoal: null,
  secondaryGoal: null,
  targetWeight: null,
  targetBodyFat: null,
  deadline: null,
})

export const defaultTraining = (): Training => ({
  experienceLevel: 'unspecified',
  trainingStyle: 'unspecified',
  preferredSplit: null,
  availableTrainingDays: 3,
  preferredSessionDuration: 45,
})

export const defaultLifestyle = (): Lifestyle => ({
  occupationActivity: 'unspecified',
  averageDailySteps: null,
  sleepTargetHours: 8,
  stressLevel: 'unspecified',
})

export const defaultNutrition = (): Nutrition => ({
  dietType: 'unspecified',
  allergies: [],
  foodPreferences: [],
  mealFrequency: 3,
})

export const defaultHealth = (): Health => ({
  injuries: [],
  mobilityRestrictions: [],
})

export const defaultEquipment = (): Equipment => ({
  availableEquipment: [],
  unavailableEquipment: [],
})

export const defaultPreferences = (): Preferences => ({
  favoriteExercises: [],
  avoidedExercises: [],
})

export const defaultAIPreferences = (): AIPreferences => ({
  coachingStyle: 'unspecified',
  motivationStyle: 'unspecified',
  notificationStyle: 'concise',
})

export const defaultUserIntelligence = (): UserIntelligence => ({
  goals: defaultGoals(),
  training: defaultTraining(),
  lifestyle: defaultLifestyle(),
  nutrition: defaultNutrition(),
  health: defaultHealth(),
  equipment: defaultEquipment(),
  preferences: defaultPreferences(),
  aiPreferences: defaultAIPreferences(),
})

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export function createUserIntelligence(
  overrides: DeepPartial<UserIntelligence> = {}
): UserIntelligence {
  const base = defaultUserIntelligence()
  return {
    ...base,
    ...overrides,
    goals: { ...base.goals, ...(overrides.goals || {}) },
    training: { ...base.training, ...(overrides.training || {}) },
    lifestyle: { ...base.lifestyle, ...(overrides.lifestyle || {}) },
    nutrition: {
      ...base.nutrition,
      ...(overrides.nutrition || {}),
      allergies: (overrides.nutrition?.allergies as unknown as string[]) ?? base.nutrition.allergies,
      foodPreferences: (overrides.nutrition?.foodPreferences as unknown as string[]) ?? base.nutrition.foodPreferences,
    },
    health: {
      ...base.health,
      ...(overrides.health || {}),
      injuries: (overrides.health?.injuries as unknown as string[]) ?? base.health.injuries,
      mobilityRestrictions:
        (overrides.health?.mobilityRestrictions as unknown as string[]) ?? base.health.mobilityRestrictions,
    },
    equipment: {
      ...base.equipment,
      ...(overrides.equipment || {}),
      availableEquipment:
        (overrides.equipment?.availableEquipment as unknown as string[]) ??
        base.equipment.availableEquipment,
      unavailableEquipment:
        (overrides.equipment?.unavailableEquipment as unknown as string[]) ??
        base.equipment.unavailableEquipment,
    },
    preferences: {
      ...base.preferences,
      ...(overrides.preferences || {}),
      favoriteExercises:
        (overrides.preferences?.favoriteExercises as unknown as string[]) ??
        base.preferences.favoriteExercises,
      avoidedExercises:
        (overrides.preferences?.avoidedExercises as unknown as string[]) ??
        base.preferences.avoidedExercises,
    },
    aiPreferences: { ...base.aiPreferences, ...(overrides.aiPreferences || {}) },
  }
}
