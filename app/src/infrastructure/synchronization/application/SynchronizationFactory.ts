import type { SynchronizationEngine } from "../engine/SynchronizationEngine";
import { SynchronizationEngineFactory } from "../engine/SynchronizationEngineFactory";
import {
  SynchronizationRegistry,
  createSynchronizationProviderRegistration,
  createSynchronizationRegistry,
} from "../registry";
import type { SynchronizationProviderToken } from "../registry/SynchronizationProviderToken";
import { validateSynchronizationBundle } from "../validation";
import type { SynchronizationValidation } from "../models/SynchronizationResult";
import type { SynchronizationQueue } from "../models/SynchronizationQueue";
import type { SynchronizationState } from "../models/SynchronizationState";
import type { SynchronizationStatistics } from "../models/SynchronizationStatistics";
import type { SynchronizationResult } from "../models/SynchronizationResult";
import { createSynchronizationResult } from "../models/SynchronizationResult";

export const SYNCHRONIZATION_ADAPTER_VERSION = "1.0.0" as const;

export interface SynchronizationBundle {
  readonly registry: SynchronizationRegistry;
  readonly engine: SynchronizationEngine;
}

export interface SynchronizationFactoryDeps {
  readonly registry?: SynchronizationRegistry;
  readonly engine?: SynchronizationEngine;
  readonly bundle?: SynchronizationBundle;
  readonly version?: string;
  readonly activeToken?: SynchronizationProviderToken;
}

const PROVIDER_NAMES: Record<SynchronizationProviderToken, string> = {
  local: "SynchronizationEngine",
};

function seedRegistry(
  registry: SynchronizationRegistry,
  engine: SynchronizationEngine,
  version: string,
): void {
  if (registry.has(engine.providerId)) {
    return;
  }
  registry.register(
    createSynchronizationProviderRegistration({
      token: engine.providerId,
      name: PROVIDER_NAMES[engine.providerId],
      version,
      providerId: engine.providerId,
      metadata: Object.freeze({
        backend: "local",
        contract: "synchronization",
      }),
    }),
    engine,
  );
}

/**
 * Factory for Synchronization Adapter Foundation (local engine).
 */
export const SynchronizationFactory = {
  create(deps: SynchronizationFactoryDeps = {}): SynchronizationBundle {
    if (deps.bundle) {
      return deps.bundle;
    }

    const version = deps.version ?? SYNCHRONIZATION_ADAPTER_VERSION;
    const engine = deps.engine ?? SynchronizationEngineFactory.create();
    const registry = deps.registry ?? createSynchronizationRegistry();
    seedRegistry(registry, engine, version);

    if (deps.activeToken) {
      registry.setActive(deps.activeToken);
    }

    return Object.freeze({
      registry,
      engine,
    });
  },
} as const;

/** Application API — active synchronization engine. */
export function getSynchronization(options: {
  readonly engine?: SynchronizationEngine;
  readonly registry?: SynchronizationRegistry;
  readonly deps?: SynchronizationFactoryDeps;
} = {}): SynchronizationEngine {
  if (options.engine) {
    return options.engine;
  }
  if (options.registry) {
    const active = options.registry.resolveActive();
    if (active) {
      return active;
    }
  }
  return SynchronizationFactory.create(options.deps).engine;
}

/** Application API — current synchronization queue snapshot. */
export function getSynchronizationQueue(options: {
  readonly engine?: SynchronizationEngine;
  readonly registry?: SynchronizationRegistry;
  readonly deps?: SynchronizationFactoryDeps;
} = {}): SynchronizationQueue {
  return getSynchronization(options).getQueue().value!;
}

/** Application API — current synchronization lifecycle state. */
export function getSynchronizationState(options: {
  readonly engine?: SynchronizationEngine;
  readonly registry?: SynchronizationRegistry;
  readonly deps?: SynchronizationFactoryDeps;
} = {}): SynchronizationState {
  return getSynchronization(options).getState().value!;
}

/** Application API — current synchronization statistics. */
export function getSynchronizationStatistics(options: {
  readonly engine?: SynchronizationEngine;
  readonly registry?: SynchronizationRegistry;
  readonly deps?: SynchronizationFactoryDeps;
} = {}): SynchronizationStatistics {
  return getSynchronization(options).getStatistics().value!;
}

/** Application API — validate synchronization wiring. */
export function validateSynchronization(options: {
  readonly registry?: SynchronizationRegistry | null;
  readonly engine?: SynchronizationEngine | null;
  readonly deps?: SynchronizationFactoryDeps;
} = {}): SynchronizationValidation {
  const hasExplicit = "registry" in options || "engine" in options;

  if (hasExplicit) {
    return validateSynchronizationBundle({
      registry: options.registry ?? null,
      engine: options.engine ?? null,
    });
  }

  const bundle = SynchronizationFactory.create(options.deps);
  return validateSynchronizationBundle(bundle);
}

export type {
  SynchronizationValidation,
  SynchronizationResult,
  SynchronizationQueue,
  SynchronizationState,
  SynchronizationStatistics,
};
export { createSynchronizationResult };
