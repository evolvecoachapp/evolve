import {
  CompositionRoot,
  type CompositionRootOptions,
} from "./CompositionRoot";
import type { ServiceMap, ServiceToken } from "./registry";

let rootInstance: CompositionRoot | undefined;

/**
 * Create a new Composition Root (does not replace the process default).
 */
export function createCompositionRoot(
  options: CompositionRootOptions = {},
): CompositionRoot {
  return CompositionRoot.create(options);
}

/**
 * Lazily initialize and return the process-wide Composition Root.
 */
export function getCompositionRoot(
  options: CompositionRootOptions = {},
): CompositionRoot {
  if (!rootInstance) {
    rootInstance = CompositionRoot.create(options);
  }
  return rootInstance;
}

/**
 * Replace / clear the process-wide root (tests only).
 */
export function resetCompositionRoot(
  next?: CompositionRoot | null,
): void {
  rootInstance = next ?? undefined;
}

/**
 * Resolve a typed service from the process-wide Composition Root.
 */
export function resolveService<K extends ServiceToken>(
  token: K,
): ServiceMap[K] {
  return getCompositionRoot().resolve(token);
}
