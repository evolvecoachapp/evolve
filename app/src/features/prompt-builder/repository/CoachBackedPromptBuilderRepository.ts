import type { AthleteContextRepository } from "../../athlete-context/repository";
import type { CoachIntelligenceRepository } from "../../coach-intelligence/repository";
import type { PromptContext } from "../models/coach/PromptContext";
import { buildPromptContext } from "../utils/buildPromptContext";
import type { PromptBuilderRepository } from "./PromptBuilderRepository";

/**
 * Prompt builder backed by coach intelligence and athlete context.
 *
 * Transforms structured domain snapshots into a PromptContext — never
 * markdown, never prompt strings, never direct history/analytics access.
 */
export class CoachBackedPromptBuilderRepository
  implements PromptBuilderRepository
{
  constructor(
    private readonly coachIntelligence: CoachIntelligenceRepository,
    private readonly athleteContext: AthleteContextRepository,
  ) {}

  async getPromptContext(
    referenceDate: Date = new Date(),
  ): Promise<PromptContext> {
    const [snapshot, athleteSnapshot] = await Promise.all([
      this.coachIntelligence.getSnapshot(referenceDate),
      this.athleteContext.getSnapshot(referenceDate),
    ]);

    return buildPromptContext(snapshot, {
      generatedAt: referenceDate.toISOString(),
      profile: athleteSnapshot.profile,
    });
  }
}
