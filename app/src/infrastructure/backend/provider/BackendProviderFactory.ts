import { MockBackendProvider } from "./MockBackendProvider";
import type { BackendProvider } from "./BackendProvider";
import type { BackendProviderToken } from "../registry/BackendProviderToken";
import { BackendRequestDispatcher } from "./BackendRequestDispatcher";
import { BackendValidator } from "./BackendValidator";
import { BackendResponseMapper } from "../responses/BackendResponseMapper";
import { createDefaultBackendEndpoints } from "../routing";
import type { BackendEndpoint } from "../models";

export interface BackendProviderFactoryDeps {
  readonly token?: BackendProviderToken;
  readonly dispatcher?: BackendRequestDispatcher;
  readonly validator?: BackendValidator;
  readonly mapper?: BackendResponseMapper;
  readonly endpoints?: readonly BackendEndpoint[];
  readonly provider?: BackendProvider;
}

/**
 * Factory for backend providers.
 * Currently produces MockBackendProvider only.
 */
export const BackendProviderFactory = {
  create(deps: BackendProviderFactoryDeps = {}): BackendProvider {
    if (deps.provider) {
      return deps.provider;
    }

    const token = deps.token ?? "mock";
    if (token !== "mock") {
      throw new Error(
        `Backend provider not implemented in this sprint: ${token}`,
      );
    }

    const mapper = deps.mapper ?? new BackendResponseMapper();
    const validator = deps.validator ?? new BackendValidator();
    const dispatcher =
      deps.dispatcher ?? new BackendRequestDispatcher(mapper, validator);

    return new MockBackendProvider(
      dispatcher,
      validator,
      deps.endpoints ?? createDefaultBackendEndpoints(),
    );
  },
} as const;
