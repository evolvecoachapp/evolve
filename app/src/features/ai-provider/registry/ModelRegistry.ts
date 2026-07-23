import type { AIModelInfo } from "../models/AIModelInfo";
import type { AIProviderId } from "../models/AIProviderId";

/**
 * Metadata-only model registry.
 * Catalogs model descriptors without provider instances or networking.
 */
export class ModelRegistry {
  private readonly models = new Map<string, AIModelInfo>();

  register(model: AIModelInfo): void {
    const key = this.key(model.providerId, model.id);
    if (this.models.has(key)) {
      throw new Error(`Model already registered: ${key}`);
    }
    this.models.set(key, Object.freeze({ ...model }));
  }

  unregister(providerId: AIProviderId, modelId: string): boolean {
    return this.models.delete(this.key(providerId, modelId));
  }

  resolve(providerId: AIProviderId, modelId: string): AIModelInfo | null {
    return this.models.get(this.key(providerId, modelId)) ?? null;
  }

  resolveByModelId(modelId: string): readonly AIModelInfo[] {
    return Object.freeze(
      [...this.models.values()].filter((model) => model.id === modelId),
    );
  }

  list(): readonly AIModelInfo[] {
    return Object.freeze([...this.models.values()]);
  }

  listByProvider(providerId: AIProviderId): readonly AIModelInfo[] {
    return Object.freeze(
      [...this.models.values()].filter(
        (model) => model.providerId === providerId,
      ),
    );
  }

  clear(): void {
    this.models.clear();
  }

  private key(providerId: AIProviderId, modelId: string): string {
    return `${providerId}::${modelId}`;
  }
}

export function createModelRegistry(): ModelRegistry {
  return new ModelRegistry();
}
