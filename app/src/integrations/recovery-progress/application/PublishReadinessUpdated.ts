import type { ReadinessState } from "../../../features/recovery-agent/models/ReadinessState";
import {
  createRecoveryProgressEvent,
  createRecoveryProgressMetadata,
  type RecoveryProgressResult,
} from "../models";
import { mapReadinessStateToUpdatedPayload } from "../mappers";
import type { RecoveryProgressPublisher } from "../publishers";
import { publishRecoveryProgress } from "./PublishRecoveryProgress";

export interface PublishReadinessUpdatedOptions {
  readonly publisher: RecoveryProgressPublisher;
  readonly readiness: ReadinessState;
  readonly dayId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly updatedAt: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishReadinessUpdated(
  options: PublishReadinessUpdatedOptions,
): Promise<RecoveryProgressResult> {
  const payload = mapReadinessStateToUpdatedPayload(
    options.readiness,
    options.dayId,
    options.updatedAt,
  );

  const event = createRecoveryProgressEvent({
    id: options.eventId,
    type: "ReadinessUpdated",
    occurredAt: options.updatedAt,
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
