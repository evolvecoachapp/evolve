import { createUserIntelligence } from "../../userIntelligence/factory"
import { DecisionContext, generateRecommendations } from "../"

describe("Decision Engine", () => {
  it("returns increaseLoad for high recovery with a strength goal", () => {
    const context: DecisionContext = {
      userIntelligence: createUserIntelligence({
        goals: { primaryGoal: "Strength" },
        training: { trainingStyle: "strength" },
      }),
      recoveryStatus: { overallRecovery: "high", muscleSoreness: "low" },
    }

    const recommendations = generateRecommendations(context)

    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workout.increaseLoad",
          category: "workout",
          title: "Increase Load",
        }),
      ])
    )
  })

  it("returns reduceVolume for low recovery", () => {
    const context: DecisionContext = {
      userIntelligence: createUserIntelligence(),
      recoveryStatus: { overallRecovery: "low", muscleSoreness: "moderate" },
    }

    const recommendations = generateRecommendations(context)

    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "recovery.reduceVolume",
          category: "recovery",
          title: "Reduce Training Volume",
        }),
      ])
    )
  })

  it("returns decreaseCalories for a fat loss goal", () => {
    const context: DecisionContext = {
      userIntelligence: createUserIntelligence({
        goals: { primaryGoal: "Fat loss" },
      }),
    }

    const recommendations = generateRecommendations(context)

    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "nutrition.decreaseCalories",
          category: "nutrition",
          title: "Decrease Calories",
        }),
      ])
    )
  })

  it("returns increaseSleep when sleep target is below 7 hours", () => {
    const context: DecisionContext = {
      userIntelligence: createUserIntelligence({
        lifestyle: { sleepTargetHours: 6 },
      }),
    }

    const recommendations = generateRecommendations(context)

    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lifestyle.increaseSleep",
          category: "lifestyle",
          title: "Increase Sleep",
        }),
      ])
    )
  })

  it("returns multiple recommendations for mixed signals", () => {
    const context: DecisionContext = {
      userIntelligence: createUserIntelligence({
        goals: { primaryGoal: "Fat loss" },
        lifestyle: { sleepTargetHours: 6, averageDailySteps: 13000 },
      }),
      recoveryStatus: { overallRecovery: "low", muscleSoreness: "high" },
    }

    const recommendations = generateRecommendations(context)

    expect(recommendations).toHaveLength(5)
    expect(recommendations.map((item: { id: string }) => item.id)).toEqual([
      "recovery.reduceVolume",
      "recovery.takeRestDay",
      "nutrition.decreaseCalories",
      "lifestyle.increaseSleep",
      "lifestyle.increaseHydration",
    ])
  })

  it("orders recommendations by descending priority", () => {
    const context: DecisionContext = {
      userIntelligence: createUserIntelligence({
        goals: { primaryGoal: "Strength" },
        training: { trainingStyle: "strength" },
        lifestyle: { sleepTargetHours: 6 },
      }),
      recoveryStatus: { overallRecovery: "high", muscleSoreness: "low" },
    }

    const recommendations = generateRecommendations(context)

    expect(recommendations[0].priority).toBeGreaterThanOrEqual(recommendations[1].priority)
    expect(recommendations[0].id).toBe("workout.increaseLoad")
  })
})
