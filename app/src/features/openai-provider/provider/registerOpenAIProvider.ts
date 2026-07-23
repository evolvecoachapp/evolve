import type { IAIProviderRegistry } from "../../ai-provider/contracts/IAIProviderRegistry";
import type { OpenAIChatTransport } from "../client/OpenAIClient";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import {
  createOpenAIProvider,
  type OpenAIProvider,
  type OpenAIProviderOptions,
} from "../provider/OpenAIProvider";

/**
 * Register OpenAIProvider on an AI Provider Registry (factory-compatible).
 */
export function registerOpenAIProvider(
  registry: IAIProviderRegistry,
  options: OpenAIProviderOptions = {},
): OpenAIProvider {
  const provider = createOpenAIProvider(options);
  registry.register(provider);
  return provider;
}

export function createRegisteredOpenAIProvider(options?: {
  readonly registry: IAIProviderRegistry;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
  readonly registeredAt?: string;
}): OpenAIProvider {
  if (!options?.registry) {
    throw new Error("createRegisteredOpenAIProvider requires a registry");
  }
  return registerOpenAIProvider(options.registry, {
    configuration: options.configuration,
    client: options.client,
    registeredAt: options.registeredAt,
  });
}
