import { isValidProviderIdFormat } from "../models/AIProviderId";

/**
 * Normalize a provider id to lowercase trimmed slug form.
 */
export function normalizeProviderId(id: string): string {
  return id.trim().toLowerCase();
}

/**
 * Normalize and soft-validate; returns null when format is invalid.
 */
export function normalizeProviderIdOrNull(id: string): string | null {
  const normalized = normalizeProviderId(id);
  if (!normalized || !isValidProviderIdFormat(normalized)) {
    return null;
  }
  return normalized;
}
