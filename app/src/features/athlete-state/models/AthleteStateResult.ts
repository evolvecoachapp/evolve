import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteSnapshot } from "./AthleteSnapshot";
import type { AthleteState } from "./AthleteState";
import type { CoachSupervisorContext } from "./CoachSupervisorContext";
import type { StateDiagnostics } from "./StateDiagnostics";
import type { StateError } from "./StateError";
import type { StateSummary } from "./StateSummary";
import type { StateValidation } from "./StateValidation";
import type { AthleteStateDescriptor } from "./AthleteStateDescriptor";

export const AthleteStateOperationKinds = {
  BUILD: "build",
  UPDATE: "update",
  SNAPSHOT: "snapshot",
  DESCRIBE: "describe",
  VALIDATE: "validate",
} as const;

export type AthleteStateOperationKind =
  (typeof AthleteStateOperationKinds)[keyof typeof AthleteStateOperationKinds];

/**
 * Immutable primary output of Athlete State Engine operations.
 */
export interface AthleteStateResult {
  readonly id: string;
  readonly operation: AthleteStateOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly athleteId: string | null;
  readonly state: AthleteState | null;
  readonly snapshot: AthleteSnapshot | null;
  readonly summary: StateSummary | null;
  readonly supervisorContext: CoachSupervisorContext | null;
  readonly descriptor: AthleteStateDescriptor | null;
  readonly validation: StateValidation;
  readonly diagnostics: StateDiagnostics;
  readonly error: StateError | null;
  readonly metadata: AthleteMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
