import type { RepositoryAdapterToken } from "./RepositoryAdapterToken";
import type { RepositoryAdapterMetadata } from "./RepositoryAdapterMetadata";
import { createRepositoryAdapterMetadata } from "./RepositoryAdapterMetadata";

/**
 * Immutable descriptor for a registered repository adapter.
 */
export interface RepositoryAdapterRegistration {
  readonly token: RepositoryAdapterToken;
  readonly name: string;
  readonly version: string;
  readonly repositoryId: RepositoryAdapterToken;
  readonly metadata: RepositoryAdapterMetadata;
}

export function createRepositoryAdapterRegistration(input: {
  readonly token: RepositoryAdapterToken;
  readonly name: string;
  readonly version: string;
  readonly repositoryId: RepositoryAdapterToken;
  readonly metadata?: Readonly<Record<string, string>>;
}): RepositoryAdapterRegistration {
  return Object.freeze({
    token: input.token,
    name: input.name,
    version: input.version,
    repositoryId: input.repositoryId,
    metadata: createRepositoryAdapterMetadata(input.metadata ?? {}),
  });
}
