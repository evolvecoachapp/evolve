import type { BackendProvider } from "../provider/BackendProvider";
import { BackendProviderFactory } from "../provider/BackendProviderFactory";
import { MockBackendProvider } from "../provider/MockBackendProvider";
import {
  BackendRegistry,
  createBackendRegistration,
  createBackendRegistry,
} from "../registry";
import type { BackendProviderToken } from "../registry/BackendProviderToken";
import { validateBackendBundle } from "../validation";
import type { BackendValidation } from "../models/BackendResult";
import type { BackendCapabilities } from "../models/BackendCapabilities";
import type { BackendEndpoint } from "../models/BackendEndpoint";
import type { BackendHealth } from "../models/BackendHealth";
import type { BackendResult } from "../models/BackendResult";
import { createBackendResult } from "../models/BackendResult";

export const BACKEND_ADAPTER_VERSION = "1.0.0" as const;

export interface BackendBundle {
  readonly registry: BackendRegistry;
  readonly provider: BackendProvider;
  readonly mockProvider: MockBackendProvider;
}

export interface BackendFactoryDeps {
  readonly registry?: BackendRegistry;
  readonly provider?: BackendProvider;
  readonly mockProvider?: MockBackendProvider;
  readonly bundle?: BackendBundle;
  readonly version?: string;
  readonly activeToken?: BackendProviderToken;
}

const PROVIDER_NAMES: Record<BackendProviderToken, string> = {
  mock: "MockBackendProvider",
};

function seedRegistry(
  registry: BackendRegistry,
  provider: BackendProvider,
  version: string,
): void {
  if (registry.has(provider.providerId)) {
    return;
  }
  registry.register(
    createBackendRegistration({
      token: provider.providerId,
      name: PROVIDER_NAMES[provider.providerId],
      version,
      providerId: provider.providerId,
      metadata: Object.freeze({
        backend: "mock",
        contract: "backend",
      }),
    }),
    provider,
  );
}

/**
 * Factory for Backend API Adapter Foundation (Mock provider).
 */
export const BackendFactory = {
  create(deps: BackendFactoryDeps = {}): BackendBundle {
    if (deps.bundle) {
      return deps.bundle;
    }

    const version = deps.version ?? BACKEND_ADAPTER_VERSION;
    const mockProvider =
      deps.mockProvider ??
      (deps.provider instanceof MockBackendProvider
        ? deps.provider
        : new MockBackendProvider());
    const provider =
      deps.provider ??
      BackendProviderFactory.create({ provider: mockProvider });
    const registry = deps.registry ?? createBackendRegistry();
    seedRegistry(registry, provider, version);

    if (deps.activeToken) {
      registry.setActive(deps.activeToken);
    }

    return Object.freeze({
      registry,
      provider,
      mockProvider:
        provider instanceof MockBackendProvider ? provider : mockProvider,
    });
  },
} as const;

/** Application API — active backend provider. */
export function getBackend(options: {
  readonly provider?: BackendProvider;
  readonly registry?: BackendRegistry;
  readonly deps?: BackendFactoryDeps;
} = {}): BackendProvider {
  if (options.provider) {
    return options.provider;
  }
  if (options.registry) {
    const active = options.registry.resolveActive();
    if (active) {
      return active;
    }
  }
  return BackendFactory.create(options.deps).provider;
}

/** Application API — backend health snapshot. */
export function getBackendHealth(options: {
  readonly provider?: BackendProvider;
  readonly registry?: BackendRegistry;
  readonly deps?: BackendFactoryDeps;
} = {}): BackendHealth {
  return getBackend(options).getHealth().value!;
}

/** Application API — backend capability flags. */
export function getBackendCapabilities(options: {
  readonly provider?: BackendProvider;
  readonly registry?: BackendRegistry;
  readonly deps?: BackendFactoryDeps;
} = {}): BackendCapabilities {
  return getBackend(options).getCapabilities().value!;
}

/** Application API — registered backend endpoints. */
export function listBackendEndpoints(options: {
  readonly provider?: BackendProvider;
  readonly registry?: BackendRegistry;
  readonly deps?: BackendFactoryDeps;
} = {}): readonly BackendEndpoint[] {
  return getBackend(options).getEndpoints().value!;
}

/** Application API — validate backend wiring. */
export function validateBackend(options: {
  readonly registry?: BackendRegistry | null;
  readonly provider?: BackendProvider | null;
  readonly deps?: BackendFactoryDeps;
} = {}): BackendValidation {
  const hasExplicit = "registry" in options || "provider" in options;

  if (hasExplicit) {
    return validateBackendBundle({
      registry: options.registry ?? null,
      provider: options.provider ?? null,
    });
  }

  const bundle = BackendFactory.create(options.deps);
  return validateBackendBundle(bundle);
}

export type {
  BackendValidation,
  BackendResult,
  BackendCapabilities,
  BackendEndpoint,
  BackendHealth,
};
export { createBackendResult };
