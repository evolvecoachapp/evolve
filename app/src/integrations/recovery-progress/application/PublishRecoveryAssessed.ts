import type { RecoveryAssessment } from "../../../features/recovery-agent/models/RecoveryAssessment";
import {
  createRecoveryProgressEvent,
  createRecoveryProgressMetadata,
  type RecoveryProgressResult,
} from "../models";
import { mapRecoveryAssessmentToAssessedPayload } from "../mappers";
import type { RecoveryProgressPublisher } from "../publishers";
import { publishRecoveryProgress } from "./PublishRecoveryProgress";

export interface PublishRecoveryAssessedOptions {
  readonly publisher: RecoveryProgressPublisher;
  readonly assessment: RecoveryAssessment;
  readonly dayId: string;
  readonly correlationId: string;
  readonly eventId: string;
  readonly publishedAt: string;
  readonly athleteId?: string | null;
}

export async function publishRecoveryAssessed(
  options: PublishRecoveryAssessedOptions,
): Promise<RecoveryProgressResult> {
  const payload = mapRecoveryAssessmentToAssessedPayload(
    options.assessment,
    options.dayId,
  );

  const event = createRecoveryProgressEvent({
    id: options.eventId,
    type: "RecoveryAssessed",
    occurredAt: options.assessment.assessedAt,
    metadata: createRecoveryProgressMetadata({
      source: "recovery",
      correlationId: options.correlationId,
      dayId: options.dayId,
      assessmentId: options.assessment.id,
      athleteId: options.athleteId ?? null,
      publishedAt: options.publishedAt,
    }),
    payload,
  });

  return publishRecoveryProgress({ publisher: options.publisher, event });
}
