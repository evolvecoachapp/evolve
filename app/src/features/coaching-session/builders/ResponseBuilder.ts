import {
  SessionConfidenceLevels,
  type SessionConfidence,
} from "../models/SessionConfidence";
import { EMPTY_SESSION_DIAGNOSTICS } from "../models/SessionDiagnostics";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionResponse } from "../models/SessionResponse";
import type { CoachSupervisorPortResult } from "../contracts/CoachSupervisorPort";
import { freezeResponse } from "../utils/FreezeSessionState";

function toConfidence(score: number): SessionConfidence {
  const level =
    score >= 0.8
      ? SessionConfidenceLevels.HIGH
      : score >= 0.5
        ? SessionConfidenceLevels.MEDIUM
        : score > 0
          ? SessionConfidenceLevels.LOW
          : SessionConfidenceLevels.UNKNOWN;
  return Object.freeze({
    level,
    score,
    rationale: "Derived from Coach Supervisor port result.",
  });
}

export function buildSessionResponse(input: {
  readonly id: string;
  readonly sessionId: string;
  readonly requestId: string;
  readonly supervisor: CoachSupervisorPortResult;
  readonly createdAt: string;
}): SessionResponse {
  return freezeResponse({
    id: input.id,
    sessionId: input.sessionId,
    requestId: input.requestId,
    message: input.supervisor.responseMessage ?? input.supervisor.message ?? "",
    sections: Object.freeze([...input.supervisor.sections]),
    agentIds: Object.freeze([...input.supervisor.agentIds]),
    capabilityIds: Object.freeze([...input.supervisor.capabilityIds]),
    confidence: toConfidence(input.supervisor.confidenceScore),
    diagnostics: {
      ...EMPTY_SESSION_DIAGNOSTICS,
      id: `diag:${input.id}`,
      notes: Object.freeze([
        input.supervisor.success
          ? "Supervisor invocation succeeded."
          : "Supervisor invocation failed.",
      ]),
      createdAt: input.createdAt,
    },
    metadata: EMPTY_SESSION_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
