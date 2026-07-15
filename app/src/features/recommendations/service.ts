import { generateRecommendations } from "../decisionEngine"
import type {
  RecommendationContext,
  RecommendationFeed,
  RecommendationService,
  RecommendationStore,
} from "./types"
import { InMemoryRecommendationStore } from "./store"

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`
  }

  const keys = Object.keys(value as Record<string, unknown>).sort()
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(",")}}`
}

const createContextVersion = (context: RecommendationContext): string => {
  const { contextVersion, ...payload } = context
  return stableStringify(payload)
}

export class DefaultRecommendationService implements RecommendationService {
  constructor(private readonly store: RecommendationStore) {}

  generateAndStoreRecommendations(context: RecommendationContext): RecommendationFeed {
    const recommendations = generateRecommendations(context)
    const contextVersion = context.contextVersion ?? createContextVersion(context)
    const feed: RecommendationFeed = {
      recommendations,
      generatedAt: new Date(),
      contextVersion,
    }

    this.store.save(feed)
    return feed
  }
}

export function createRecommendationService(
  store: RecommendationStore = new InMemoryRecommendationStore()
): RecommendationService {
  return new DefaultRecommendationService(store)
}

export const recommendationStore = new InMemoryRecommendationStore()
export const recommendationService = createRecommendationService(recommendationStore)
