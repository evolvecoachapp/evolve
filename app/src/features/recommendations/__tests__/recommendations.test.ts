import { resetCompositionRoot } from "../../../core/composition"
import { createUserIntelligence } from "../../userIntelligence/factory"
import { InMemoryRecommendationStore } from "../store"
import {
  createLegacyRecommendationService,
  createRecommendationService,
} from "../service"
import type { RecommendationContext } from "../types"

describe("RecommendationStore", () => {
  it("stores and retrieves the latest feed", () => {
    const store = new InMemoryRecommendationStore()
    const feed = {
      recommendations: [],
      generatedAt: new Date(),
      contextVersion: "v1",
    }

    store.save(feed)

    expect(store.getLatest()).toEqual(feed)
  })

  it("replaces previous feed when a new feed is saved", () => {
    const store = new InMemoryRecommendationStore()
    const firstFeed = {
      recommendations: [],
      generatedAt: new Date(0),
      contextVersion: "first",
    }
    const secondFeed = {
      recommendations: [],
      generatedAt: new Date(1),
      contextVersion: "second",
    }

    store.save(firstFeed)
    store.save(secondFeed)

    expect(store.getLatest()).toEqual(secondFeed)
  })

  it("clears the stored feed", () => {
    const store = new InMemoryRecommendationStore()
    const feed = {
      recommendations: [],
      generatedAt: new Date(),
      contextVersion: "v1",
    }

    store.save(feed)
    store.clear()

    expect(store.getLatest()).toBeNull()
  })
})

describe("RecommendationService", () => {
  afterEach(() => {
    resetCompositionRoot()
  })

  it("generates recommendations via Composition Root and stores the latest feed", () => {
    const store = new InMemoryRecommendationStore()
    const service = createRecommendationService(store)
    const context: RecommendationContext = {
      userIntelligence: createUserIntelligence({
        goals: { primaryGoal: "Strength" },
      }),
    }

    const feed = service.generateAndStoreRecommendations(context)

    expect(feed.recommendations.length).toBeGreaterThan(0)
    expect(feed.generatedAt).toBeInstanceOf(Date)
    expect(feed.contextVersion).toEqual(expect.any(String))
    expect(store.getLatest()).toEqual(feed)
  })

  it("preserves an explicit contextVersion when provided", () => {
    const store = new InMemoryRecommendationStore()
    const service = createRecommendationService(store)
    const context: RecommendationContext = {
      userIntelligence: createUserIntelligence(),
      contextVersion: "custom-version",
    }

    const feed = service.generateAndStoreRecommendations(context)

    expect(feed.contextVersion).toBe("custom-version")
    expect(store.getLatest()?.contextVersion).toBe("custom-version")
  })

  it("legacy rule path still generates deterministic recommendations", () => {
    const store = new InMemoryRecommendationStore()
    const service = createLegacyRecommendationService(store)
    const context: RecommendationContext = {
      userIntelligence: createUserIntelligence({
        goals: { primaryGoal: "Strength" },
      }),
    }

    const feed = service.generateAndStoreRecommendations(context)

    expect(feed.recommendations.length).toBeGreaterThan(0)
    expect(store.getLatest()).toEqual(feed)
  })
})
