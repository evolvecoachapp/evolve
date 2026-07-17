import { DailyCoachListener } from "./listeners/dailyCoachListener"
import { NotificationListener } from "./listeners/notificationListener"
import { RecommendationListener } from "./listeners/recommendationListener"
import { initializeWeightUpdatedPipeline } from "./integration/weightUpdatedPipeline"

let initialized = false

export function initializeEventSystem(): void {
  if (initialized) {
    return
  }

  initialized = true

  new DailyCoachListener().subscribe()
  new RecommendationListener().subscribe()
  new NotificationListener().subscribe()
  initializeWeightUpdatedPipeline()
}
