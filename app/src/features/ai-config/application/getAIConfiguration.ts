import {
  aiConfigurationRepository,
  type AIConfigurationLoadResult,
  type AIConfigurationRepository,
} from "../repository";

export interface GetAIConfigurationOptions {
  readonly repository?: AIConfigurationRepository;
}

/**
 * Loads AI configuration via the repository layer.
 */
export async function getAIConfiguration({
  repository = aiConfigurationRepository,
}: GetAIConfigurationOptions = {}): Promise<AIConfigurationLoadResult> {
  return repository.getConfiguration();
}
