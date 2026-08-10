import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  createRecoveryDayRuntimeState,
  createRecoveryRuntimePersistenceState,
  type RecoveryDayRuntimeState,
  type RecoveryRuntimePersistenceState,
} from "../models/RecoveryRuntimePersistenceState";

export interface PersistRecoveryRuntimeMutationInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly isoDate: string;
  readonly dayState: RecoveryDayRuntimeState;
}

function mergeRecoveryDayState(
  current: RecoveryRuntimePersistenceState | null,
  athleteId: string,
  isoDate: string,
  dayState: RecoveryDayRuntimeState,
): RecoveryRuntimePersistenceState {
  return createRecoveryRuntimePersistenceState({
    athleteId,
    days: Object.freeze({
      ...(current?.days ?? {}),
      [isoDate]: createRecoveryDayRuntimeState(dayState),
    }),
  });
}

/**
 * Persists in-session recovery runtime overlays through RecoveryRuntimePersistenceService.build().
 */
export function persistRecoveryRuntimeMutation(
  input: PersistRecoveryRuntimeMutationInput,
): void {
  const service = getCompositionRoot().resolve("RecoveryRuntimePersistenceService");
  const current = service.getState(input.athleteId);
  const next = mergeRecoveryDayState(
    current,
    input.athleteId,
    input.isoDate,
    input.dayState,
  );

  service.build({
    athleteId: input.athleteId,
    requestId: input.requestId,
    state: next,
  });
}

export function readPersistedRecoveryDayState(
  athleteId: string,
  isoDate: string,
): RecoveryDayRuntimeState | null {
  const state = getCompositionRoot()
    .resolve("RecoveryRuntimePersistenceService")
    .getState(athleteId);
  return state?.days[isoDate] ?? null;
}
