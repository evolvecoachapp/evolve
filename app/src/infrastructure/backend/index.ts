/**
 * Backend API Adapter Foundation (Sprint 30.5).
 *
 * Application → Backend API Contract → Backend API Adapter → Mock Backend Provider
 *
 * Deterministic backend adapter representing every future backend communication.
 * No HTTP / REST / GraphQL / sockets / networking / FastAPI / ASP.NET / Express /
 * NestJS / serialization / JSON parsing / cloud / business logic.
 */

export * from "./models";
export {
  BACKEND_PROVIDER_TOKENS,
  isBackendProviderToken,
  createBackendRegistration,
  BackendRegistry,
  createBackendRegistry,
  BackendRegistrationError,
  BackendValidationError,
  BackendProviderNotFoundError,
  type BackendProviderToken,
  type BackendRegistration,
} from "./registry";
export { createDefaultBackendEndpoints } from "./routing";
export { BackendResponseMapper } from "./responses";
export {
  MockBackendProvider,
  BackendValidator,
  BackendRequestDispatcher,
  BackendProviderFactory,
  type BackendProvider,
  type BackendProviderFactoryDeps,
} from "./provider";
export { validateBackendBundle } from "./validation";
export {
  BackendFactory,
  getBackend,
  getBackendHealth,
  getBackendCapabilities,
  listBackendEndpoints,
  validateBackend,
  BACKEND_ADAPTER_VERSION,
  type BackendBundle,
  type BackendFactoryDeps,
} from "./application";
