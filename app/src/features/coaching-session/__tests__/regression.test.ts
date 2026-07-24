import {
  continueSession,
  startSession,
} from "../application";
import { SessionRequestKinds } from "../models/SessionRequest";
import {
  createSessionRequest,
  createTestSessionService,
} from "../testSupport/fixtures";

describe("coaching-session regression", () => {
  it("does not replace Conversation Runtime or execute domain logic", () => {
    const service = createTestSessionService();
    const started = startSession({
      service,
      request: createSessionRequest({
        kind: SessionRequestKinds.START,
        sessionId: "session:reg:1",
      }),
    });
    expect(started.success).toBe(true);
    // Orchestration-only: response comes from supervisor port mock text.
    expect(started.response?.message).toContain("Unified coach response");
    expect(started.context?.metadata).toBeDefined();

    const duplicate = startSession({
      service,
      request: createSessionRequest({
        id: "request:dup",
        kind: SessionRequestKinds.START,
        sessionId: "session:reg:1",
      }),
    });
    expect(duplicate.success).toBe(false);

    const orphanContinue = continueSession({
      service,
      request: createSessionRequest({
        id: "request:orphan",
        kind: SessionRequestKinds.CONTINUE,
        sessionId: "session:missing",
        message: "hello",
      }),
    });
    expect(orphanContinue.success).toBe(false);
  });
});
