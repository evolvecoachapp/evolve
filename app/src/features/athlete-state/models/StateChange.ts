import type { AthleteMetadata } from "./AthleteMetadata";
import type { StateVersion } from "./StateVersion";

export const StateChangeKinds = {
  BUILD: "build",
  UPDATE: "update",
  SNAPSHOT: "snapshot",
  AGGREGATE: "aggregate",
  TRANSITION: "transition",
} as const;

export type StateChangeKind =
  (typeof StateChangeKinds)[keyof typeof StateChangeKinds];

/**
 * Immutable record of a state change.
 */
export interface StateChange {
  readonly id: string;
  readonly kind: StateChangeKind;
  readonly athleteId: string;
  readonly fromVersion: StateVersion | null;
  readonly toVersion: StateVersion;
  readonly paths: readonly string[];
  readonly summary: string;
  readonly source: string;
  readonly metadata: AthleteMetadata;
  readonly changedAt: string;
}
