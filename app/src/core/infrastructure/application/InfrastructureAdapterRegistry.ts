import type { AdapterCapability } from "../contracts/AdapterCapability";
import type { AdapterValidation } from "../contracts/AdapterValidation";
import type { AdaptersView } from "../contracts/AdaptersView";
import type { AdapterRegistration } from "../registry/AdapterRegistration";
import type { AdapterToken } from "../adapters/AdapterToken";
import {
  createAdapterRegistry,
  type AdapterRegistry,
} from "../registry/AdapterRegistry";
import {
  createDefaultAdapterRegistrations,
  INFRASTRUCTURE_ADAPTER_CONTRACT_VERSION,
  INFRASTRUCTURE_ADAPTER_SCHEMA_VERSION,
} from "./defaultRegistrations";

export interface InfrastructureAdapterRegistryDeps {
  readonly adapters?: AdapterRegistry;
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly seedDefaults?: boolean;
}

/**
 * Aggregates infrastructure adapter contract registry.
 * Contracts only — no adapter implementations.
 */
export class InfrastructureAdapterRegistry {
  readonly adapters: AdapterRegistry;
  private readonly clock: () => string;
  private readonly version: string;
  private readonly schemaVersion: string;

  constructor(deps: InfrastructureAdapterRegistryDeps = {}) {
    const seedDefaults = deps.seedDefaults !== false;
    this.adapters =
      deps.adapters ??
      createAdapterRegistry(
        seedDefaults ? createDefaultAdapterRegistrations() : [],
      );
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.version = deps.version ?? INFRASTRUCTURE_ADAPTER_CONTRACT_VERSION;
    this.schemaVersion =
      deps.schemaVersion ?? INFRASTRUCTURE_ADAPTER_SCHEMA_VERSION;
  }

  getAdapterRegistry(): AdapterRegistry {
    return this.adapters;
  }

  getRegisteredAdapters(): readonly AdapterRegistration[] {
    return this.adapters.list();
  }

  getAdapterCapabilities(
    token: AdapterToken,
  ): readonly AdapterCapability[] | null {
    return this.adapters.capabilities(token);
  }

  getAdaptersView(): AdaptersView {
    return Object.freeze({
      version: this.version,
      schemaVersion: this.schemaVersion,
      adapters: this.adapters.list(),
      generatedAt: this.clock(),
    });
  }

  validate(): AdapterValidation {
    return this.adapters.validate();
  }
}

export function createInfrastructureAdapterRegistry(
  deps: InfrastructureAdapterRegistryDeps = {},
): InfrastructureAdapterRegistry {
  return new InfrastructureAdapterRegistry(deps);
}
