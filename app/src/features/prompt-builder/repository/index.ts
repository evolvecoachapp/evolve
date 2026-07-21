import { coachIntelligenceRepository } from "../../coach-intelligence/repository";
import { CoachBackedPromptBuilderRepository } from "./CoachBackedPromptBuilderRepository";
import type { PromptBuilderRepository } from "./PromptBuilderRepository";

export type { PromptBuilderRepository } from "./PromptBuilderRepository";
export { CoachBackedPromptBuilderRepository } from "./CoachBackedPromptBuilderRepository";

/** Default prompt builder repository (coach intelligence backed). */
export const promptBuilderRepository: PromptBuilderRepository =
  new CoachBackedPromptBuilderRepository(coachIntelligenceRepository);
