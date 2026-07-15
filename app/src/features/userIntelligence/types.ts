export type Goal = {
  primaryGoal: string | null
  secondaryGoal: string | null
  targetWeight: number | null
  targetBodyFat: number | null
  deadline: string | null
}

export type Training = {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'unspecified'
  trainingStyle: 'strength' | 'hypertrophy' | 'endurance' | 'mixed' | 'unspecified'
  preferredSplit: string | null
  availableTrainingDays: number
  preferredSessionDuration: number // minutes
}

export type Lifestyle = {
  occupationActivity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | 'unspecified'
  averageDailySteps: number | null
  sleepTargetHours: number | null
  stressLevel: 'low' | 'moderate' | 'high' | 'unspecified'
}

export type Nutrition = {
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'unspecified'
  allergies: string[]
  foodPreferences: string[]
  mealFrequency: number | null
}

export type Health = {
  injuries: string[]
  mobilityRestrictions: string[]
}

export type Equipment = {
  availableEquipment: string[]
  unavailableEquipment: string[]
}

export type Preferences = {
  favoriteExercises: string[]
  avoidedExercises: string[]
}

export type AIPreferences = {
  coachingStyle: 'directive' | 'collaborative' | 'suggestive' | 'unspecified'
  motivationStyle: 'encouraging' | 'challenging' | 'neutral' | 'unspecified'
  notificationStyle: 'verbose' | 'concise' | 'silent' | 'unspecified'
}

export type UserIntelligence = {
  id?: string
  goals: Goal
  training: Training
  lifestyle: Lifestyle
  nutrition: Nutrition
  health: Health
  equipment: Equipment
  preferences: Preferences
  aiPreferences: AIPreferences
  createdAt?: string
  updatedAt?: string
}
