import type { AdapterCapability } from "../contracts/AdapterCapability";
import type { AdapterValidation } from "../contracts/AdapterValidation";
import type { AdapterRegistration } from "../registry/AdapterRegistration";
import type { AdapterToken } from "../adapters/AdapterToken";
import type { AdapterRegistry } from "../registry/AdapterRegistry";
import {
  createInfrastructureAdapterRegistry,
  type InfrastructureAdapterRegistry,
  type InfrastructureAdapterRegistryDeps,
} from "./InfrastructureAdapterRegistry";

function resolveRegistry(
  registry: InfrastructureAdapterRegistry | undefined,
  deps: InfrastructureAdapterRegistryDeps | undefined,
): InfrastructureAdapterRegistry {
  if (registry) return registry;
  return createInfrastructureAdapterRegistry(deps ?? {});
}

/** Application API — infrastructure adapter contract registry. */
export function getAdapterRegistry(options: {
  readonly registry?: InfrastructureAdapterRegistry;
  readonly deps?: InfrastructureAdapterRegistryDeps;
} = {}): AdapterRegistry {
  return resolveRegistry(options.registry, options.deps).getAdapterRegistry();
}

/** Application API — registered adapter contract descriptors. */
export function getRegisteredAdapters(options: {
  readonly registry?: InfrastructureAdapterRegistry;
  readonly deps?: InfrastructureAdapterRegistryDeps;
} = {}): readonly AdapterRegistration[] {
  return resolveRegistry(
    options.registry,
    options.deps,
  ).getRegisteredAdapters();
}

/** Application API — validate infrastructure adapter contract integrity. */
export function validateAdapters(options: {
  readonly registry?: InfrastructureAdapterRegistry;
  readonly deps?: InfrastructureAdapterRegistryDeps;
} = {}): AdapterValidation {
  return resolveRegistry(options.registry, options.deps).validate();
}

/** Application API — capabilities for a registered adapter token. */
export function getAdapterCapabilities(options: {
  readonly token: AdapterToken;
  readonly registry?: InfrastructureAdapterRegistry;
  readonly deps?: InfrastructureAdapterRegistryDeps;
}): readonly AdapterCapability[] | null {
  return resolveRegistry(options.registry, options.deps).getAdapterCapabilities(
    options.token,
  );
}

export type { InfrastructureAdapterRegistryDeps };
