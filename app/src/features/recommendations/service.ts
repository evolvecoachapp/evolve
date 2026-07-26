import {
  createRecommendationEngineBridgeService,
  resolveService,
} from "../../core/composition"
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

/**
 * Legacy rule-based recommendation generator (`decisionEngine`).
 * Retained as Composition Root fallback and for unit tests that need deterministic rules.
 *
 * @deprecated Prefer `createRecommendationService` / Composition Root Recommendation Engine.
 */
export class LegacyRuleRecommendationService implements RecommendationService {
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

/**
 * Thin facade over the Composition Root Recommendation Engine.
 * Preserves the legacy `RecommendationService` + store contract for Dashboard / notifications.
 * Falls back to `LegacyRuleRecommendationService` only when composition is unavailable.
 */
export class DefaultRecommendationService implements RecommendationService {
  private readonly legacy: LegacyRuleRecommendationService

  constructor(private readonly store: RecommendationStore) {
    this.legacy = new LegacyRuleRecommendationService(store)
  }

  generateAndStoreRecommendations(context: RecommendationContext): RecommendationFeed {
    try {
      return createRecommendationEngineBridgeService(
        resolveService("RecommendationEngineService"),
        this.store,
      ).generateAndStoreRecommendations(context)
    } catch {
      return this.legacy.generateAndStoreRecommendations(context)
    }
  }
}

/**
 * Application default: Composition Root Recommendation Engine via bridge.
 */
export function createRecommendationService(
  store: RecommendationStore = new InMemoryRecommendationStore()
): RecommendationService {
  return new DefaultRecommendationService(store)
}

/**
 * Explicit legacy rule path (tests / emergency fallback).
 *
 * @deprecated Prefer `createRecommendationService`.
 */
export function createLegacyRecommendationService(
  store: RecommendationStore = new InMemoryRecommendationStore()
): RecommendationService {
  return new LegacyRuleRecommendationService(store)
}

export const recommendationStore = new InMemoryRecommendationStore()
export const recommendationService = createRecommendationService(recommendationStore)
