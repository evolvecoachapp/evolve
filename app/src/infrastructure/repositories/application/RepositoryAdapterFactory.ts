import type { SQLiteRepositories } from "../../sqlite/repositories";
import { SQLiteAdapterFactory } from "../../sqlite/application";
import {
  createRepositoryAdapters,
  type RepositoryAdapters,
} from "../adapters";
import {
  createRepositoryAdapterRegistration,
  createRepositoryAdapterRegistry,
  RepositoryAdapterRegistry,
  type RepositoryAdapterValidation,
} from "../registry";
import { REPOSITORY_ADAPTER_TOKENS } from "../registry/RepositoryAdapterToken";
import type { RepositoryAdapterToken } from "../registry/RepositoryAdapterToken";
import { validateRepositoryAdapterBundle } from "../validation";

export const REPOSITORY_ADAPTER_VERSION = "1.0.0" as const;

export interface RepositoryAdapterBundle {
  readonly registry: RepositoryAdapterRegistry;
  readonly adapters: RepositoryAdapters;
  readonly repositories: SQLiteRepositories;
}

export interface RepositoryAdapterFactoryDeps {
  readonly repositories?: SQLiteRepositories;
  readonly registry?: RepositoryAdapterRegistry;
  readonly adapters?: RepositoryAdapters;
  readonly bundle?: RepositoryAdapterBundle;
  readonly version?: string;
}

const ADAPTER_NAMES: Record<RepositoryAdapterToken, string> = {
  athlete: "AthleteRepositoryAdapter",
  identity: "IdentityRepositoryAdapter",
  workspace: "WorkspaceRepositoryAdapter",
  snapshot: "SnapshotRepositoryAdapter",
  timeline: "TimelineRepositoryAdapter",
  workout: "WorkoutRepositoryAdapter",
  nutrition: "NutritionRepositoryAdapter",
  recovery: "RecoveryRepositoryAdapter",
  settings: "SettingsRepositoryAdapter",
  runtime: "RuntimeRepositoryAdapter",
};

function seedRegistry(
  registry: RepositoryAdapterRegistry,
  adapters: RepositoryAdapters,
  version: string,
): void {
  for (const token of REPOSITORY_ADAPTER_TOKENS) {
    if (registry.has(token)) {
      continue;
    }
    registry.register(
      createRepositoryAdapterRegistration({
        token,
        name: ADAPTER_NAMES[token],
        version,
        repositoryId: token,
        metadata: Object.freeze({
          backend: "sqlite",
          contract: "persistence",
        }),
      }),
      adapters[token],
    );
  }
}

/**
 * Factory for Persistence Contract → SQLite repository adapters.
 */
export const RepositoryAdapterFactory = {
  create(deps: RepositoryAdapterFactoryDeps = {}): RepositoryAdapterBundle {
    if (deps.bundle) {
      return deps.bundle;
    }

    const repositories =
      deps.repositories ?? SQLiteAdapterFactory.create().repositories;
    const adapters = deps.adapters ?? createRepositoryAdapters(repositories);
    const version = deps.version ?? REPOSITORY_ADAPTER_VERSION;
    const registry = deps.registry ?? createRepositoryAdapterRegistry();
    seedRegistry(registry, adapters, version);

    return Object.freeze({
      registry,
      adapters,
      repositories,
    });
  },
} as const;

/** Application API — all repository adapters. */
export function getRepositoryAdapters(options: {
  readonly adapters?: RepositoryAdapters;
  readonly registry?: RepositoryAdapterRegistry;
  readonly repositories?: SQLiteRepositories;
  readonly deps?: RepositoryAdapterFactoryDeps;
} = {}): RepositoryAdapters {
  if (options.adapters) {
    return options.adapters;
  }
  if (options.registry) {
    const map = options.registry.getAdapters();
    if (
      REPOSITORY_ADAPTER_TOKENS.every((token) => map[token] !== undefined)
    ) {
      return Object.freeze({
        athlete: map.athlete!,
        identity: map.identity!,
        workspace: map.workspace!,
        snapshot: map.snapshot!,
        timeline: map.timeline!,
        workout: map.workout!,
        nutrition: map.nutrition!,
        recovery: map.recovery!,
        settings: map.settings!,
        runtime: map.runtime!,
      }) as RepositoryAdapters;
    }
  }
  return RepositoryAdapterFactory.create({
    repositories: options.repositories,
    ...options.deps,
  }).adapters;
}

/** Application API — single repository adapter by token. */
export function getRepositoryAdapter<T extends RepositoryAdapterToken>(
  token: T,
  options: {
    readonly adapters?: RepositoryAdapters;
    readonly registry?: RepositoryAdapterRegistry;
    readonly repositories?: SQLiteRepositories;
    readonly deps?: RepositoryAdapterFactoryDeps;
  } = {},
): RepositoryAdapters[T] {
  if (options.adapters) {
    return options.adapters[token];
  }
  if (options.registry) {
    const resolved = options.registry.resolve(token);
    if (resolved) {
      return resolved as RepositoryAdapters[T];
    }
  }
  return getRepositoryAdapters(options)[token];
}

/** Application API — validate repository adapter wiring. */
export function validateRepositoryAdapters(options: {
  readonly registry?: RepositoryAdapterRegistry | null;
  readonly adapters?: RepositoryAdapters | null;
  readonly repositories?: SQLiteRepositories;
  readonly deps?: RepositoryAdapterFactoryDeps;
} = {}): RepositoryAdapterValidation {
  const hasExplicit = "registry" in options || "adapters" in options;

  if (hasExplicit) {
    return validateRepositoryAdapterBundle({
      registry: options.registry ?? null,
      adapters: options.adapters ?? null,
    });
  }

  const bundle = RepositoryAdapterFactory.create({
    repositories: options.repositories,
    ...options.deps,
  });
  return validateRepositoryAdapterBundle(bundle);
}

export type { RepositoryAdapterValidation };
