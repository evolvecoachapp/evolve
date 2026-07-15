import type { DecisionRecommendation } from "../decisionEngine/types"

export interface RecommendationViewModel {
  id: string
  title: string
  description: string
  reason: string
  category: string
  categoryBadge: string
  priority: number
  priorityLabel: string
  confidence: string
}

const priorityLabelFor = (priority: number): string => {
  if (priority >= 90) return "High"
  if (priority >= 70) return "Medium"
  return "Low"
}

const badgeFor = (category: DecisionRecommendation["category"]): string => {
  switch (category) {
    case "workout":
      return "Workout"
    case "recovery":
      return "Recovery"
    case "nutrition":
      return "Nutrition"
    case "lifestyle":
      return "Lifestyle"
    default:
      return ""
  }
}

export const presentRecommendation = (rec: DecisionRecommendation): RecommendationViewModel => ({
  id: rec.id,
  title: rec.title,
  description: rec.description,
  reason: rec.reason,
  category: rec.category,
  categoryBadge: badgeFor(rec.category),
  priority: rec.priority,
  priorityLabel: priorityLabelFor(rec.priority),
  confidence: `${Math.round(rec.confidence)}%`,
})

export const pickHighestPriority = (recs: DecisionRecommendation[]) =>
  recs.reduce((best, curr) => (curr.priority > best.priority ? curr : best), recs[0])
