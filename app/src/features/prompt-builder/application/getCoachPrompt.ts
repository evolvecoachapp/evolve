import {
  promptBuilderRepository,
  type PromptBuilderRepository,
} from "../repository";
import type { PromptContext } from "../models/PromptContext";

export interface GetCoachPromptOptions {
  readonly repository?: PromptBuilderRepository;
  readonly referenceDate?: Date;
}

/**
 * Loads a structured prompt context for `useCoachPrompt`.
 */
export async function getCoachPrompt({
  repository = promptBuilderRepository,
  referenceDate,
}: GetCoachPromptOptions = {}): Promise<PromptContext> {
  return repository.getPromptContext(referenceDate);
}
