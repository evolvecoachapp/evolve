import type { SleepProfile } from "../../../features/recovery-agent/models/SleepProfile";
import {
  createRecoveryProgressEvent,
  createRecoveryProgressMetadata,
  type RecoveryProgressResult,
} from "../models";
import { mapSleepProfileToLoggedPayload } from "../mappers";
import type { RecoveryProgressPublisher } from "../publishers";
import { publishRecoveryProgress } from "./PublishRecoveryProgress";

export interface PublishSleepLoggedOptions {
  readonly publisher: RecoveryProgressPublisher;
  readonly sleep: SleepProfile;
  readonly dayId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly loggedAt: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishSleepLogged(
  options: PublishSleepLoggedOptions,
): Promise<RecoveryProgressResult> {
  const payload = mapSleepProfileToLoggedPayload(
    options.sleep,
    options.dayId,
    options.loggedAt,
  );

  const event = createRecoveryProgressEvent({
    id: options.eventId,
    type: "SleepLogged",
    occurredAt: options.loggedAt,
    metadata: createRecoveryProgressMetadata({
      source: "recovery",
      correlationId: options.correlationId,
      dayId: options.dayId,
      assessmentId: null,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishRecoveryProgress({ publisher: options.publisher, event });
}
