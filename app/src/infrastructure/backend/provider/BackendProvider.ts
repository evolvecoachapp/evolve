import type { BackendAdapter } from "../../../core/infrastructure/adapters/BackendAdapter";
import type { AdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import type { BackendCapabilities } from "../models/BackendCapabilities";
import type { BackendEndpoint } from "../models/BackendEndpoint";
import type { BackendHealth } from "../models/BackendHealth";
import type { BackendRequest } from "../models/BackendRequest";
import type { BackendResponse } from "../models/BackendResponse";
import type { BackendResult } from "../models/BackendResult";
import type { BackendProviderToken } from "../registry/BackendProviderToken";

/**
 * Backend provider contract.
 * Extends Infrastructure BackendAdapter; replaceable without Domain changes.
 */
export interface BackendProvider extends BackendAdapter {
  readonly providerId: BackendProviderToken;
  /** Capability flags (property). Adapter operation is `capabilities()`. */
  readonly capabilityFlags: BackendCapabilities;

  send(
    request: Readonly<Record<string, string>>,
  ): AdapterResult<string> | Promise<AdapterResult<string>>;

  execute(
    request: Readonly<Record<string, string>>,
  ): AdapterResult<string> | Promise<AdapterResult<string>>;

  dispatch(
    request: Readonly<Record<string, string>>,
  ): AdapterResult<string> | Promise<AdapterResult<string>>;

  health(): AdapterResult<string> | Promise<AdapterResult<string>>;

  capabilities():
    | AdapterResult<Readonly<Record<string, string>>>
    | Promise<AdapterResult<Readonly<Record<string, string>>>>;

  listEndpoints():
    | AdapterResult<ReadonlyArray<string>>
    | Promise<AdapterResult<ReadonlyArray<string>>>;

  sendRequest(request: BackendRequest): BackendResult<BackendResponse>;

  executeRequest(request: BackendRequest): BackendResult<BackendResponse>;

  dispatchRequest(request: BackendRequest): BackendResult<BackendResponse>;

  getHealth(): BackendResult<BackendHealth>;

  getCapabilities(): BackendResult<BackendCapabilities>;

  getEndpoints(): BackendResult<readonly BackendEndpoint[]>;
}
