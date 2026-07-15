import type { DecisionContext, DecisionRecommendation } from "../decisionEngine"

export interface RecommendationFeed {
  recommendations: DecisionRecommendation[]
  generatedAt: Date
  contextVersion: string
}

export interface RecommendationContext extends DecisionContext {
  contextVersion?: string
}

export interface RecommendationStore {
  save(feed: RecommendationFeed): void
  getLatest(): RecommendationFeed | null
  clear(): void
}

export interface RecommendationService {
  generateAndStoreRecommendations(context: RecommendationContext): RecommendationFeed
}
