import { buildSessionResponse } from "../builders/ResponseBuilder";
import { buildCoachingSessionDescriptor } from "../builders/SessionBuilder";
import { buildSessionResult } from "../builders/SessionResultBuilder";
import { buildSessionSnapshot } from "../builders/SessionSnapshotBuilder";
import { buildSessionSummary } from "../builders/SummaryBuilder";
import { buildSessionTimeline } from "../builders/TimelineBuilder";
import { SessionEventTypes } from "../models/SessionEvent";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import { SessionOperationKinds } from "../models/SessionResult";
import { SessionPhases } from "../models/SessionPhase";
import { SessionStatuses } from "../models/SessionState";
import { buildSessionCheckpoint } from "../context/SessionCheckpointBuilder";
import { buildSessionContext } from "../context/SessionContextBuilder";
import { buildEmptySessionHistory } from "../context/SessionHistoryBuilder";
import { createSessionLifecycleManager } from "../lifecycle/SessionLifecycleManager";
import { createSessionManager } from "../session/SessionManager";
import {
  createSessionRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coaching-session builders", () => {
  it("builds frozen descriptor / response / summary / timeline / result", () => {
    const descriptor = buildCoachingSessionDescriptor({
      id: "runtime:coaching-session",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.capabilities.length).toBe(5);
    expect(Object.isFrozen(descriptor)).toBe(true);

    const response = buildSessionResponse({
      id: "resp:1",
      sessionId: "session:1",
      requestId: "req:1",
      supervisor: {
        success: true,
        message: "ok",
        responseMessage: "Unified coach response",
        sections: ["overview"],
        agentIds: ["agent:workout"],
        capabilityIds: ["capability:generate_workout"],
        confidenceScore: 0.85,
        errorMessage: null,
      },
      createdAt: FIXED_TIMESTAMP,
    });
    expect(response.message).toContain("Unified coach response");

    const sessionId = "session:1";
    const request = createSessionRequest({ sessionId });
    const state = createSessionManager().createState({
      id: "state:1",
      sessionId,
      updatedAt: FIXED_TIMESTAMP,
    });
    const lifecycle = createSessionLifecycleManager().create({
      id: "life:1",
      sessionId,
      updatedAt: FIXED_TIMESTAMP,
    });
    const context = buildSessionContext({
      id: "ctx:1",
      sessionId,
      conversationId: "conversation:1",
      athleteId: "athlete:1",
      request,
      state,
      lifecycle,
      history: buildEmptySessionHistory({
        id: "hist:1",
        sessionId,
        createdAt: FIXED_TIMESTAMP,
      }),
      checkpoint: buildSessionCheckpoint({
        id: "cp:1",
        sessionId,
        turnCount: 0,
        status: SessionStatuses.IDLE,
        phase: SessionPhases.IDLE,
        lastRequestId: null,
        lastResponseId: null,
        createdAt: FIXED_TIMESTAMP,
      }),
      createdAt: FIXED_TIMESTAMP,
    });
    const summary = buildSessionSummary({
      id: "sum:1",
      context,
      agentInvocationCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(summary.headline).toContain(sessionId);

    const timeline = buildSessionTimeline({
      id: "tl:1",
      sessionId,
      events: [
        {
          id: "e1",
          type: SessionEventTypes.SESSION_STARTED,
          sessionId,
          requestId: request.id,
          message: "started",
          metadata: EMPTY_SESSION_METADATA,
          occurredAt: FIXED_TIMESTAMP,
        },
      ],
      createdAt: FIXED_TIMESTAMP,
    });
    expect(timeline.items.length).toBe(1);

    const snapshot = buildSessionSnapshot({
      id: "snap:1",
      sessionId,
      request,
      context,
      response,
      summary,
      timeline,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(snapshot.response).not.toBeNull();

    const result = buildSessionResult({
      id: "result:1",
      operation: SessionOperationKinds.START,
      success: true,
      sessionId,
      request,
      context,
      response,
      summary,
      snapshot,
      startedAt: FIXED_TIMESTAMP,
      completedAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });
});
