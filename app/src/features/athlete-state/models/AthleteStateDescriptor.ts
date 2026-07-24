import type { AthleteMetadata } from "./AthleteMetadata";

export const AthleteStateCapabilityKinds = {
  BUILD: "build_athlete_state",
  UPDATE: "update_athlete_state",
  SNAPSHOT: "create_snapshot",
  DESCRIBE: "describe_athlete_state",
  VALIDATE: "validate_athlete_state",
} as const;

export type AthleteStateCapabilityKind =
  (typeof AthleteStateCapabilityKinds)[keyof typeof AthleteStateCapabilityKinds];

/**
 * Immutable descriptor of the Athlete State Engine.
 */
export interface AthleteStateDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly AthleteStateCapabilityKind[];
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
}
