import { buildSessionCheckpoint } from "../context/SessionCheckpointBuilder";
import { buildSessionContext } from "../context/SessionContextBuilder";
import { createSessionContextManager } from "../context/SessionContextManager";
import { buildEmptySessionHistory } from "../context/SessionHistoryBuilder";
import { createSessionLifecycleManager } from "../lifecycle/SessionLifecycleManager";
import { SessionPhases } from "../models/SessionPhase";
import { SessionStatuses } from "../models/SessionState";
import { createSessionManager } from "../session/SessionManager";
import {
  createSessionRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coaching-session context", () => {
  it("builds immutable context / history / checkpoint", () => {
    const sessionId = "session:ctx:1";
    const request = createSessionRequest({ sessionId });
    const manager = createSessionManager();
    const lifecycle = createSessionLifecycleManager().create({
      id: "life:1",
      sessionId,
      updatedAt: FIXED_TIMESTAMP,
    });
    const state = manager.createState({
      id: "state:1",
      sessionId,
      updatedAt: FIXED_TIMESTAMP,
    });
    const history = buildEmptySessionHistory({
      id: "hist:1",
      sessionId,
      createdAt: FIXED_TIMESTAMP,
    });
    const checkpoint = buildSessionCheckpoint({
      id: "cp:1",
      sessionId,
      turnCount: 1,
      status: SessionStatuses.ACTIVE,
      phase: SessionPhases.INTERACT,
      lastRequestId: request.id,
      lastResponseId: null,
      createdAt: FIXED_TIMESTAMP,
    });
    const context = buildSessionContext({
      id: "ctx:1",
      sessionId,
      conversationId: request.conversationId,
      athleteId: request.athleteId,
      request,
      state,
      lifecycle,
      history,
      checkpoint,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(context)).toBe(true);
    expect(context.history.entries.length).toBe(0);

    const next = createSessionContextManager().withTurn({
      context,
      entryId: "entry:1",
      request,
      response: null,
      state: manager.updateState({
        state,
        status: SessionStatuses.ACTIVE,
        phase: SessionPhases.INTERACT,
        turnCount: 1,
        updatedAt: FIXED_TIMESTAMP,
      }),
      lifecycle,
      checkpoint,
      updatedAt: FIXED_TIMESTAMP,
    });
    expect(next.history.entries.length).toBe(1);
    expect(next).not.toBe(context);
  });
});
