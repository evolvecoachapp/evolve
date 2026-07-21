import {
  EnvironmentLoader,
  type EnvironmentSource,
} from "../environment/EnvironmentLoader";
import { AIConfigurationFactory } from "../factory/AIConfigurationFactory";
import { validateConfiguration } from "../validation/validateConfiguration";
import type {
  AIConfigurationLoadResult,
  AIConfigurationRepository,
} from "./AIConfigurationRepository";

/**
 * Environment-backed AI configuration repository.
 *
 * Isolates process.env access behind EnvironmentLoader.
 */
export class EnvironmentAIConfigurationRepository
  implements AIConfigurationRepository
{
  constructor(
    private readonly loader: EnvironmentLoader = new EnvironmentLoader(),
    private readonly source?: EnvironmentSource,
  ) {}

  async getConfiguration(): Promise<AIConfigurationLoadResult> {
    const environment = this.loader.load(this.source ?? process.env);
    const configuration = AIConfigurationFactory.create({ environment });
    const validation = validateConfiguration(configuration);

    return Object.freeze({
      configuration,
      validation,
    });
  }
}
