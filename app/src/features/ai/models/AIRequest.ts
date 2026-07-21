import type { AIModel } from "./AIModel";
import type { ChatMessage } from "./ChatMessage";
import type { ConversationContext } from "./ConversationContext";

/**
 * Structured generation request for an AIProvider.
 *
 * Built from PromptContext by AIService — never contains Workout,
 * Analytics, Records, or Coach Intelligence domain types.
 */
export interface AIRequest {
  readonly messages: readonly ChatMessage[];
  readonly conversation?: ConversationContext;
  readonly model?: AIModel;
  /** Prompt schema version from PromptBuilder metadata. */
  readonly schemaVersion: number;
  /** Included prompt section identifiers. */
  readonly sectionIds: readonly string[];
  /** Athlete consistency score in `[0, 1]`. */
  readonly consistencyScore: number;
  readonly insightCount: number;
  readonly riskCount: number;
  readonly recommendationCount: number;
  /** ISO-8601 timestamp when the source prompt context was built. */
  readonly promptGeneratedAt: string;
}
