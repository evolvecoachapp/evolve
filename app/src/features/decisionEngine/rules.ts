import {
  DecisionContext,
  DecisionRecommendation,
  DecisionRecommendationCategory,
} from "./types"

function buildRecommendation(
  category: DecisionRecommendationCategory,
  id: string,
  title: string,
  description: string,
  reason: string,
  priority: number,
  confidence: number
): DecisionRecommendation {
  return {
    id,
    category,
    title,
    description,
    reason,
    priority,
    confidence,
  }
}

function isStrengthGoal(context: DecisionContext): boolean {
  const primaryGoal = context.userIntelligence.goals.primaryGoal?.toLowerCase() ?? ""
  return (
    primaryGoal.includes("strength") ||
    primaryGoal.includes("power") ||
    primaryGoal.includes("gain") ||
    context.userIntelligence.training.trainingStyle === "strength"
  )
}

function isFatLossGoal(context: DecisionContext): boolean {
  const primaryGoal = context.userIntelligence.goals.primaryGoal?.toLowerCase() ?? ""
  return (
    primaryGoal.includes("fat") ||
    primaryGoal.includes("cut") ||
    primaryGoal.includes("lose") ||
    context.userIntelligence.goals.targetBodyFat !== null
  )
}

function shouldIncreaseSleep(context: DecisionContext): boolean {
  const sleepTarget = context.userIntelligence.lifestyle.sleepTargetHours
  return typeof sleepTarget === "number" && sleepTarget < 7
}

export function applyDecisionRules(context: DecisionContext): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = []

  const recoveryLevel = context.recoveryStatus?.overallRecovery ?? "unspecified"

  if (recoveryLevel === "low") {
    recommendations.push(
      buildRecommendation(
        "recovery",
        "recovery.reduceVolume",
        "Reduce Training Volume",
        "Lower training volume until recovery improves.",
        "The recovery score is low, which raises the risk of overtraining.",
        100,
        95
      )
    )

    if (context.recoveryStatus?.muscleSoreness === "high") {
      recommendations.push(
        buildRecommendation(
          "recovery",
          "recovery.takeRestDay",
          "Take a Rest Day",
          "Resting today helps support recovery and avoid injury.",
          "High soreness is present while recovery is low.",
          95,
          90
        )
      )
    }
  }

  if (recoveryLevel === "high" && isStrengthGoal(context)) {
    recommendations.push(
      buildRecommendation(
        "workout",
        "workout.increaseLoad",
        "Increase Load",
        "Increase training load progressively while recovery is strong.",
        "The goal is strength and overall recovery is high.",
        90,
        90
      )
    )
  }

  if (recoveryLevel === "medium" && isStrengthGoal(context)) {
    recommendations.push(
      buildRecommendation(
        "workout",
        "workout.maintainLoad",
        "Maintain Load",
        "Keep the current training load steady while recovery is adequate.",
        "Recovery is medium and the strength goal is still prioritized.",
        75,
        80
      )
    )
  }

  if (isFatLossGoal(context)) {
    recommendations.push(
      buildRecommendation(
        "nutrition",
        "nutrition.decreaseCalories",
        "Decrease Calories",
        "Moderate calorie reduction supports fat loss goals.",
        "The primary goal indicates a fat loss objective.",
        85,
        85
      )
    )
  }

  if (shouldIncreaseSleep(context)) {
    recommendations.push(
      buildRecommendation(
        "lifestyle",
        "lifestyle.increaseSleep",
        "Increase Sleep",
        "Aim for more sleep to support recovery and training adaptation.",
        "The sleep target is below 7 hours.",
        80,
        80
      )
    )
  }

  if (context.userIntelligence.lifestyle.averageDailySteps !== null && context.userIntelligence.lifestyle.averageDailySteps >= 12000) {
    recommendations.push(
      buildRecommendation(
        "lifestyle",
        "lifestyle.increaseHydration",
        "Increase Hydration",
        "Higher daily movement increases fluid needs.",
        "Daily steps are above 12,000, suggesting greater hydration demand.",
        65,
        70
      )
    )
  }

  if (recommendations.length === 0) {
    recommendations.push(
      buildRecommendation(
        "workout",
        "workout.maintainLoad",
        "Maintain Load",
        "Continue the current training plan with consistent effort.",
        "No deterministic adjustments were triggered.",
        50,
        60
      )
    )
  }

  return recommendations
}
