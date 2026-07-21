import { EnvironmentAIConfigurationRepository } from "./EnvironmentAIConfigurationRepository";
import type { AIConfigurationRepository } from "./AIConfigurationRepository";

export type {
  AIConfigurationLoadResult,
  AIConfigurationRepository,
} from "./AIConfigurationRepository";
export { EnvironmentAIConfigurationRepository } from "./EnvironmentAIConfigurationRepository";

/** Default AI configuration repository (environment-backed). */
export const aiConfigurationRepository: AIConfigurationRepository =
  new EnvironmentAIConfigurationRepository();
