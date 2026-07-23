import type { AIModelInfo } from "../models/AIModelInfo";
import type { AIProviderId } from "../models/AIProviderId";
import type { ModelRegistry } from "../registry/ModelRegistry";

/**
 * Select models from the metadata-only model registry.
 */
export class ModelSelector {
  constructor(private readonly models: ModelRegistry) {}

  byId(modelId: string): readonly AIModelInfo[] {
    return this.models.resolveByModelId(modelId);
  }

  byProvider(providerId: AIProviderId): readonly AIModelInfo[] {
    return this.models.listByProvider(providerId);
  }

  available(): readonly AIModelInfo[] {
    return Object.freeze(
      this.models.list().filter((model) => model.available),
    );
  }

  firstAvailableForProvider(
    providerId: AIProviderId,
  ): AIModelInfo | null {
    return (
      this.byProvider(providerId).find((model) => model.available) ?? null
    );
  }
}

export function createModelSelector(models: ModelRegistry): ModelSelector {
  return new ModelSelector(models);
}
