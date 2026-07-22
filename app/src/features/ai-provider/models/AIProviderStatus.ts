/**
 * Lifecycle / availability status for a registered provider descriptor.
 */
export type AIProviderStatus =
  | "unregistered"
  | "registered"
  | "available"
  | "unavailable"
  | "degraded"
  | "disabled";

export const AIProviderStatuses = Object.freeze({
  UNREGISTERED: "unregistered",
  REGISTERED: "registered",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  DEGRADED: "degraded",
  DISABLED: "disabled",
} as const satisfies Record<string, AIProviderStatus>);

export const ALL_PROVIDER_STATUSES: readonly AIProviderStatus[] = Object.freeze([
  AIProviderStatuses.UNREGISTERED,
  AIProviderStatuses.REGISTERED,
  AIProviderStatuses.AVAILABLE,
  AIProviderStatuses.UNAVAILABLE,
  AIProviderStatuses.DEGRADED,
  AIProviderStatuses.DISABLED,
]);

export function isAvailableStatus(status: AIProviderStatus): boolean {
  return status === AIProviderStatuses.AVAILABLE;
}
