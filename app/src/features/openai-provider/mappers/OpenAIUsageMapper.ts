import type { AITokenUsage } from "../../ai-provider/models/AITokenUsage";
import type { AIUsage } from "../../ai-provider/models/AIUsage";
import type { OpenAIUsage } from "../models/OpenAIUsage";
import { ZERO_OPENAI_USAGE } from "../models/OpenAIUsage";
import { freezeUsage } from "../utils/freezeObjects";

/**
 * Maps OpenAI usage → AITokenUsage / AIUsage.
 *
 * No business logic. No pricing algorithms beyond optional cost passthrough.
 */
export class OpenAIUsageMapper {
  static toTokenUsage(usage: OpenAIUsage | null | undefined): AITokenUsage {
    const source = usage ?? ZERO_OPENAI_USAGE;
    return Object.freeze({
      promptTokens: source.promptTokens,
      completionTokens: source.completionTokens,
      totalTokens: source.totalTokens,
    });
  }

  static toAIUsage(
    usage: OpenAIUsage | null | undefined,
    options: {
      readonly estimatedCost?: number | null;
      readonly currency?: string | null;
    } = {},
  ): AIUsage {
    const tokens = OpenAIUsageMapper.toTokenUsage(usage);
    return Object.freeze({
      ...tokens,
      estimatedCost: options.estimatedCost ?? null,
      currency: options.currency ?? null,
    });
  }

  static fromRaw(raw: {
    readonly prompt_tokens?: number | null;
    readonly completion_tokens?: number | null;
    readonly total_tokens?: number | null;
  } | null | undefined): OpenAIUsage {
    if (!raw) {
      return ZERO_OPENAI_USAGE;
    }
    return freezeUsage({
      promptTokens: raw.prompt_tokens ?? 0,
      completionTokens: raw.completion_tokens ?? 0,
      totalTokens: raw.total_tokens ?? 0,
    });
  }
}
