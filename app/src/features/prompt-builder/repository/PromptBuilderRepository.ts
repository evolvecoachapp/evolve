import type { PromptContext } from "../models/coach/PromptContext";

/**
 * Read-only prompt builder derived from coach intelligence.
 *
 * Implementations must consume `CoachIntelligenceRepository` only and must
 * never call LLM providers, networking, history, or analytics directly.
 */
export interface PromptBuilderRepository {
  /** Complete structured prompt context for a future AI provider. */
  getPromptContext(referenceDate?: Date): Promise<PromptContext>;
}
