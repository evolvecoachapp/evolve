/**
 * Immutable capability descriptors for Runtime Environment (Sprint 29.2).
 *
 * Declared support only — does not query hardware or OS permissions.
 */
export interface Capabilities {
  readonly supportsNotifications: boolean;
  readonly supportsOffline: boolean;
  readonly supportsBiometrics: boolean;
  readonly supportsBackgroundSync: boolean;
  readonly supportsHealthIntegration: boolean;
  readonly supportsCamera: boolean;
  readonly supportsMicrophone: boolean;
  /** Unique capability identifiers derived from enabled flags. */
  readonly capabilityIds: readonly string[];
}
