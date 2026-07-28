import type { RepositoryAdapters } from "../adapters";
import type { RepositoryAdapterRegistry } from "../registry/RepositoryAdapterRegistry";
import type { RepositoryAdapterValidation } from "../registry/RepositoryAdapterRegistry";
import { REPOSITORY_ADAPTER_TOKENS } from "../registry/RepositoryAdapterToken";

/**
 * Validate repository adapter wiring:
 * missing repository, duplicate registrations, contract compliance,
 * adapter registration, repository compatibility.
 */
export function validateRepositoryAdapterBundle(input: {
  readonly registry?: RepositoryAdapterRegistry | null;
  readonly adapters?: RepositoryAdapters | null;
}): RepositoryAdapterValidation {
  const errors: string[] = [];

  if (!input.registry) {
    errors.push("Missing adapter registration");
  } else {
    const registryValidation = input.registry.validate();
    errors.push(...registryValidation.errors);
  }

  if (!input.adapters) {
    errors.push("Missing repository adapters");
  } else {
    for (const token of REPOSITORY_ADAPTER_TOKENS) {
      const adapter = input.adapters[token];
      if (!adapter) {
        errors.push(`Missing repository: ${token}`);
        continue;
      }
      if (adapter.repositoryId !== token) {
        errors.push(`Contract compliance failure: ${token}`);
      }
      if (typeof adapter.findById !== "function") {
        errors.push(
          `Repository compatibility failure: findById missing on ${token}`,
        );
      }
      if (typeof adapter.save !== "function") {
        errors.push(
          `Repository compatibility failure: save missing on ${token}`,
        );
      }
      if (typeof adapter.delete !== "function") {
        errors.push(
          `Repository compatibility failure: delete missing on ${token}`,
        );
      }
      if (typeof adapter.list !== "function") {
        errors.push(
          `Repository compatibility failure: list missing on ${token}`,
        );
      }
      if (typeof adapter.exists !== "function") {
        errors.push(
          `Repository compatibility failure: exists missing on ${token}`,
        );
      }

      if (input.registry && !input.registry.has(token)) {
        errors.push(`Adapter registration missing: ${token}`);
      }
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...errors]),
  });
}
