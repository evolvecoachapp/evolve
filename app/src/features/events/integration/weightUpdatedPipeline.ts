import { eventDispatcher } from "../dispatcher"
import type { WeightUpdated } from "../types"
import { generateDailyInsights } from "../../dailyCoach"
import type { DailyContext, CoachInsight } from "../../dailyCoach/types"
import {
  createRecommendationEngineBridgeService,
  resolveService,
} from "../../../core/composition"
import {
  recommendationService as legacyRecommendationService,
  recommendationStore,
} from "../../recommendations/service"
import type { RecommendationContext } from "../../recommendations/types"
import { generateNotifications } from "../../notifications/generator"
import { notificationStore } from "../../notifications/service"
import { defaultUserIntelligence } from "../../userIntelligence/factory"

let initialized = false

/**
 * Resolve the Recommendation Engine bridge (new pipeline).
 * Falls back to the legacy recommendation service if composition is unavailable.
 */
function resolveRecommendationService() {
  try {
    return createRecommendationEngineBridgeService(
      resolveService("RecommendationEngineService"),
      recommendationStore,
    )
  } catch {
    return legacyRecommendationService
  }
}

export function initializeWeightUpdatedPipeline(): void {
  if (initialized) {
    return
  }

  initialized = true
  eventDispatcher.subscribe<WeightUpdated>("WeightUpdated", handleWeightUpdated)
}

function handleWeightUpdated(event: WeightUpdated): void {
  const dailyContext = buildDailyContext(event)
  const insights = generateDailyInsights(dailyContext)

  const recommendationContext = buildRecommendationContext(event, insights)
  const feed = resolveRecommendationService().generateAndStoreRecommendations(
    recommendationContext,
  )

  const notifications = generateNotifications(feed)
  notificationStore.saveNotifications(notifications)
}

function buildDailyContext(event: WeightUpdated): DailyContext {
  return {
    date: event.timestamp,

    currentWeightKg: event.weightKg,
    previousWeightKg: event.previousWeightKg,
    nutrition: undefined,
    recoveryScore: undefined,
    sleepHours: undefined,
    waterLiters: undefined,
    workoutsPlanned: [],
    workoutsCompleted: [],
    personalRecords: [],
  }
}

function buildRecommendationContext(event: WeightUpdated, insights: CoachInsight[]): RecommendationContext {
  const userIntelligence = defaultUserIntelligence()
  const weightTrend = event.previousWeightKg !== undefined ? event.weightKg - event.previousWeightKg : 0
  const primaryGoal = weightTrend < 0 ? "Fat loss" : weightTrend > 0 ? "Strength" : "Maintain"

  return {
    userIntelligence: {
      ...userIntelligence,
      goals: {
        ...userIntelligence.goals,
        primaryGoal,
        targetBodyFat: primaryGoal === "Fat loss" ? 20 : null,
      },
      training: {
        ...userIntelligence.training,
        trainingStyle: primaryGoal === "Strength" ? "strength" : userIntelligence.training.trainingStyle,
      },
    },
    recoveryStatus: {
      overallRecovery: insights.some((insight) => insight.category === "recovery") ? "low" : "medium",
      muscleSoreness: "unspecified",
    },
    workoutStatus: {
      currentLoadLevel: "unspecified",
      daysSinceLastSession: 0,
    },
    progressStatus: {
      strengthTrend: weightTrend > 0 ? "up" : weightTrend < 0 ? "down" : "flat",
      bodyFatTrend: weightTrend < 0 ? "down" : weightTrend > 0 ? "up" : "flat",
      consistency: "unspecified",
    },
  }
}

