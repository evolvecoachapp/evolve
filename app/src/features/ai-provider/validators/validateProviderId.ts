import {
  isReservedProviderId,
  isValidProviderIdFormat,
} from "../models/AIProviderId";
import { normalizeProviderId } from "../utils/normalizeProviderId";

/**
 * Soft-validate a provider id format.
 */
export function validateProviderId(providerId: string | null | undefined): readonly string[] {
  const issues: string[] = [];

  if (providerId == null || providerId.trim().length === 0) {
    issues.push("provider_id_missing");
    return issues;
  }

  const normalized = normalizeProviderId(providerId);
  if (!isValidProviderIdFormat(normalized)) {
    issues.push(`provider_id_invalid_format:${providerId}`);
  }

  return issues;
}

/**
 * Soft note when id is a reserved future provider slug.
 */
export function validateReservedProviderId(
  providerId: string | null | undefined,
): readonly string[] {
  if (!providerId) {
    return [];
  }
  const normalized = normalizeProviderId(providerId);
  if (isReservedProviderId(normalized)) {
    return Object.freeze([`provider_id_reserved:${normalized}`]);
  }
  return [];
}
