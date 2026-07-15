import { UserIntelligence } from "../userIntelligence/types"

export type DecisionRecommendationCategory = "workout" | "recovery" | "nutrition" | "lifestyle"

export interface DecisionRecommendation {
  id: string
  category: DecisionRecommendationCategory
  priority: number
  title: string
  description: string
  reason: string
  confidence: number
}

export type RecoveryLevel = "low" | "medium" | "high" | "unspecified"

export type WorkoutLoadLevel = "low" | "medium" | "high" | "unspecified"

export interface WorkoutStatus {
  currentLoadLevel: WorkoutLoadLevel
  daysSinceLastSession: number
}

export interface RecoveryStatus {
  overallRecovery: RecoveryLevel
  muscleSoreness: "low" | "moderate" | "high" | "unspecified"
}

export interface ProgressStatus {
  strengthTrend: "up" | "flat" | "down" | "unspecified"
  bodyFatTrend: "down" | "flat" | "up" | "unspecified"
  consistency: "behind" | "on_track" | "ahead" | "unspecified"
}

export interface DecisionContext {
  userIntelligence: UserIntelligence
  workoutStatus?: WorkoutStatus
  recoveryStatus?: RecoveryStatus
  progressStatus?: ProgressStatus
}
