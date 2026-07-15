import { createCoachNotification } from "../shared/models/CoachNotification"
import type { DecisionRecommendation } from "../decisionEngine/types"
import type { RecommendationFeed } from "../recommendations/types"
import type { NotificationGenerator } from "./types"

const CATEGORY_TYPE_MAP: Record<DecisionRecommendation["category"], "workout_reminder" | "nutrition_reminder" | "recovery_alert" | "coach_message"> = {
  workout: "workout_reminder",
  nutrition: "nutrition_reminder",
  recovery: "recovery_alert",
  lifestyle: "coach_message",
}

const mapPriority = (priority: number): "low" | "medium" | "high" => {
  if (priority >= 75) {
    return "high"
  }

  if (priority >= 40) {
    return "medium"
  }

  return "low"
}

const buildNotificationTitle = (recommendation: DecisionRecommendation): string => {
  switch (recommendation.category) {
    case "workout":
      return `Workout reminder: ${recommendation.title}`
    case "nutrition":
      return `Nutrition reminder: ${recommendation.title}`
    case "recovery":
      return `Recovery alert: ${recommendation.title}`
    case "lifestyle":
      return `Coach message: ${recommendation.title}`
    default:
      return recommendation.title
  }
}

const buildNotificationMessage = (recommendation: DecisionRecommendation): string => {
  return recommendation.description || recommendation.reason || recommendation.title
}

export function generateNotifications(feed: RecommendationFeed): ReturnType<NotificationGenerator["generateNotifications"]> {
  return feed.recommendations.map((recommendation) =>
    createCoachNotification({
      title: buildNotificationTitle(recommendation),
      message: buildNotificationMessage(recommendation),
      type: CATEGORY_TYPE_MAP[recommendation.category],
      priority: mapPriority(recommendation.priority),
      metadata: {
        recommendationId: recommendation.id,
        recommendationCategory: recommendation.category,
        recommendationReason: recommendation.reason,
        recommendationConfidence: recommendation.confidence,
      },
    })
  )
}
