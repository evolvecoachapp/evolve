import type { AthleteMetadata } from "./AthleteMetadata";
import type { SpecialistContribution } from "./SpecialistContribution";

export const AthleteStateRequestKinds = {
  BUILD: "build",
  UPDATE: "update",
  SNAPSHOT: "snapshot",
  DESCRIBE: "describe",
  VALIDATE: "validate",
} as const;

export type AthleteStateRequestKind =
  (typeof AthleteStateRequestKinds)[keyof typeof AthleteStateRequestKinds];

/**
 * Immutable request for athlete-state operations.
 */
export interface AthleteStateRequest {
  readonly id: string;
  readonly kind: AthleteStateRequestKind;
  readonly athleteId: string;
  readonly stateId: string | null;
  readonly contributions: readonly SpecialistContribution[];
  readonly sessionId: string | null;
  readonly reason: string | null;
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
}
