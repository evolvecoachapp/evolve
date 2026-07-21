import type { CoachIntelligenceRepository } from "../../coach-intelligence/repository";
import type { PromptContext } from "../models/PromptContext";
import { buildPromptContext } from "../utils/buildPromptContext";
import type { PromptBuilderRepository } from "./PromptBuilderRepository";

/**
 * Prompt builder backed exclusively by coach intelligence.
 *
 * Transforms a coach snapshot into a structured PromptContext — never
 * markdown, never prompt strings, never direct history/analytics access.
 */
export class CoachBackedPromptBuilderRepository
  implements PromptBuilderRepository
{
  constructor(
    private readonly coachIntelligence: CoachIntelligenceRepository,
  ) {}

  async getPromptContext(
    referenceDate: Date = new Date(),
  ): Promise<PromptContext> {
    const snapshot = await this.coachIntelligence.getSnapshot(referenceDate);
    return buildPromptContext(snapshot, {
      generatedAt: referenceDate.toISOString(),
    });
  }
}
