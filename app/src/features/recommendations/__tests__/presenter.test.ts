import { presentRecommendation, pickHighestPriority } from "../RecommendationPresenter"
import type { DecisionRecommendation } from "../../decisionEngine/types"

describe("RecommendationPresenter", () => {
  it("maps fields and formats confidence and labels", () => {
    const rec: DecisionRecommendation = {
      id: "r1",
      category: "workout",
      priority: 92,
      title: "Increase Load",
      description: "Progressively increase load.",
      reason: "Recovery is high",
      confidence: 89.6,
    }

    const vm = presentRecommendation(rec)

    expect(vm.id).toBe("r1")
    expect(vm.categoryBadge).toBe("Workout")
    expect(vm.priorityLabel).toBe("High")
    expect(vm.confidence).toBe("90%")
  })

  it("picks the highest priority recommendation", () => {
    const a: DecisionRecommendation = { id: "a", category: "workout", priority: 50, title: "A", description: "", reason: "", confidence: 10 }
    const b: DecisionRecommendation = { id: "b", category: "recovery", priority: 100, title: "B", description: "", reason: "", confidence: 10 }

    const best = pickHighestPriority([a, b])
    expect(best.id).toBe("b")
  })
})
