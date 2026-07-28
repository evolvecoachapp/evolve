export {
  REPOSITORY_ADAPTER_TOKENS,
  isRepositoryAdapterToken,
  type RepositoryAdapterToken,
} from "./RepositoryAdapterToken";

export {
  createRepositoryAdapterMetadata,
  type RepositoryAdapterMetadata,
} from "./RepositoryAdapterMetadata";

export {
  createRepositoryAdapterResult,
  type RepositoryAdapterResult,
} from "./RepositoryAdapterResult";

export {
  createRepositoryAdapterRegistration,
  type RepositoryAdapterRegistration,
} from "./RepositoryAdapterRegistration";

export {
  RepositoryAdapterRegistry,
  createRepositoryAdapterRegistry,
  type RepositoryAdapterValidation,
} from "./RepositoryAdapterRegistry";

export type {
  BoundRepository,
  RepositoryAdapterMap,
  RepositoryAdapterInstance,
} from "./RepositoryAdapterMap";

export {
  RepositoryAdapterRegistrationError,
  RepositoryAdapterValidationError,
  RepositoryAdapterNotFoundError,
} from "./errors";
