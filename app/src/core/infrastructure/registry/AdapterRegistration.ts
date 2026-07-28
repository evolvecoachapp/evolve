import type { AdapterCapability } from "../contracts/AdapterCapability";
import type { AdapterToken } from "../adapters/AdapterToken";
import type { AdapterMetadata } from "./AdapterMetadata";
import { createAdapterMetadata } from "./AdapterMetadata";
import type { AdapterCapabilities } from "./AdapterCapabilities";
import { createAdapterCapabilities } from "./AdapterCapabilities";

/**
 * Immutable descriptor for a registered infrastructure adapter contract.
 * Metadata only — no adapter implementation.
 */
export interface AdapterRegistration {
  readonly token: AdapterToken;
  readonly name: string;
  readonly version: string;
  readonly capabilities: AdapterCapabilities;
  readonly metadata: AdapterMetadata;
}

export function createAdapterRegistration(input: {
  readonly token: AdapterToken;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly AdapterCapability[];
  readonly metadata?: Readonly<Record<string, string>>;
}): AdapterRegistration {
  return Object.freeze({
    token: input.token,
    name: input.name,
    version: input.version,
    capabilities: createAdapterCapabilities(input.capabilities),
    metadata: createAdapterMetadata(input.metadata ?? {}),
  });
}
