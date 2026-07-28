import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for backend API providers.
 * Contracts and orchestration only — no HTTP, networking, or transport.
 */
export interface BackendAdapter {
  readonly adapterId: "backend";
  send(
    request: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<string>> | AdapterResult<string>;
  execute(
    request: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<string>> | AdapterResult<string>;
  dispatch(
    request: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<string>> | AdapterResult<string>;
  health(): Promise<AdapterResult<string>> | AdapterResult<string>;
  capabilities():
    | Promise<AdapterResult<Readonly<Record<string, string>>>>
    | AdapterResult<Readonly<Record<string, string>>>;
  listEndpoints():
    | Promise<AdapterResult<ReadonlyArray<string>>>
    | AdapterResult<ReadonlyArray<string>>;
}
