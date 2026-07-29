export const ConnectedServiceKindValues = {
  APPLE_HEALTH: "apple_health",
  GOOGLE_FIT: "google_fit",
  GARMIN: "garmin",
  WHOOP: "whoop",
  OURA: "oura",
} as const;

export type ConnectedServiceKind = (typeof ConnectedServiceKindValues)[keyof typeof ConnectedServiceKindValues];

export interface ConnectedServiceEntry {
  readonly kind: ConnectedServiceKind;
  readonly label: string;
  readonly isConnected: boolean;
  readonly lastSyncLabel: string | null;
  readonly destination: string | null;
}

export function createConnectedServiceEntry(input: ConnectedServiceEntry): ConnectedServiceEntry {
  return Object.freeze({ ...input });
}

export interface ConnectedServices {
  readonly services: readonly ConnectedServiceEntry[];
}

export function createConnectedServices(input: ConnectedServices): ConnectedServices {
  return Object.freeze({
    services: Object.freeze([...input.services]),
  });
}
