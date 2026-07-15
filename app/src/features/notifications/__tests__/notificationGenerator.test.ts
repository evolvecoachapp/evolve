import { generateNotifications } from "../generator"
import { InMemoryNotificationStore } from "../store"
import type { RecommendationFeed } from "../../recommendations/types"
import { createCoachNotification } from "../../shared/models/CoachNotification"

describe("NotificationGenerator", () => {
  const feed: RecommendationFeed = {
    generatedAt: new Date(),
    contextVersion: "test-v1",
    recommendations: [
      {
        id: "rec-workout-1",
        category: "workout",
        priority: 90,
        title: "Schedule strength workout",
        description: "Your recovery is good and the training load is ready.",
        reason: "Consistent effort last week.",
        confidence: 0.92,
      },
      {
        id: "rec-nutrition-1",
        category: "nutrition",
        priority: 55,
        title: "Boost protein intake",
        description: "A balanced meal plan will support muscle recovery.",
        reason: "Nutrition shortfall detected.",
        confidence: 0.78,
      },
      {
        id: "rec-recovery-1",
        category: "recovery",
        priority: 20,
        title: "Rest your muscles",
        description: "Low recovery readiness suggests a lighter day.",
        reason: "High soreness level.",
        confidence: 0.64,
      },
      {
        id: "rec-lifestyle-1",
        category: "lifestyle",
        priority: 50,
        title: "Hydration reminder",
        description: "Drink water throughout the day.",
        reason: "Dehydration risk is elevated.",
        confidence: 0.71,
      },
    ],
  }

  it("maps recommendations to coach notifications with category and priority types", () => {
    const notifications = generateNotifications(feed)

    expect(notifications).toHaveLength(4)
    expect(notifications[0]).toMatchObject({
      type: "workout_reminder",
      priority: "high",
      title: "Workout reminder: Schedule strength workout",
      message: "Your recovery is good and the training load is ready.",
      metadata: expect.objectContaining({ recommendationId: "rec-workout-1" }),
    })
    expect(notifications[1].type).toBe("nutrition_reminder")
    expect(notifications[1].priority).toBe("medium")
    expect(notifications[2].type).toBe("recovery_alert")
    expect(notifications[2].priority).toBe("low")
    expect(notifications[3].type).toBe("coach_message")
    expect(notifications[3].priority).toBe("medium")
  })
})
