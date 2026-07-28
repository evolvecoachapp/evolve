import type { AdapterRegistration } from "../registry/AdapterRegistration";

/**
 * Frozen snapshot of all registered infrastructure adapter contracts.
 */
export interface AdaptersView {
  readonly version: string;
  readonly schemaVersion: string;
  readonly adapters: readonly AdapterRegistration[];
  readonly generatedAt: string;
}
