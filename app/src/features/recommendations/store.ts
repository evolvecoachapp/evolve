import type { RecommendationFeed, RecommendationStore } from "./types"

export class InMemoryRecommendationStore implements RecommendationStore {
  private latestFeed: RecommendationFeed | null = null

  save(feed: RecommendationFeed): void {
    this.latestFeed = feed
  }

  getLatest(): RecommendationFeed | null {
    return this.latestFeed
  }

  clear(): void {
    this.latestFeed = null
  }
}
