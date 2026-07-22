import type { AIProviderHealth } from "../models/AIProviderHealth";
import type { IAIProvider } from "./IAIProvider";

/**
 * Health-capable provider contract.
 *
 * Health is descriptor-level only in this sprint — no live probes.
 */
export interface IAIHealthProvider extends IAIProvider {
  getHealth(): AIProviderHealth;
}
