export enum InsightCategory {
  NUTRITION = 'nutrition',
  RECOVERY = 'recovery',
  WORKOUT = 'workout',
  LIFESTYLE = 'lifestyle',
  PROGRESS = 'progress',
}

export enum InsightPriority {
  HIGH = 3,
  MEDIUM = 2,
  LOW = 1,
}

export interface CoachInsight {
  id: string
  title: string
  message: string
  category: InsightCategory
  priority: InsightPriority
}

export interface DailyContext {
  date?: string
  nutrition?: {
    calories?: number
    targetCalories?: number
    protein?: number
    targetProtein?: number
  }
  recoveryScore?: number // 0-100
  sleepHours?: number
  waterLiters?: number
  workoutsPlanned?: string[]
  workoutsCompleted?: string[]
  personalRecords?: Array<{ exerciseId: string; isNewPR: boolean }>
  currentWeightKg?: number
  previousWeightKg?: number
}
