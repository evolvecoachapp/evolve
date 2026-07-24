import {
  continueSession,
  endSession,
  startSession,
} from "../application";
import { SessionRequestKinds } from "../models/SessionRequest";
import {
  createSessionRequest,
  createTestSessionService,
} from "../testSupport/fixtures";

describe("coaching-session integration", () => {
  it("runs end-to-end session with mocked Coach Supervisor", () => {
    const service = createTestSessionService();
    const sessionId = "session:integration:1";

    const started = startSession({
      service,
      request: createSessionRequest({
        kind: SessionRequestKinds.START,
        sessionId,
      }),
    });
    expect(started.success).toBe(true);
    expect(started.response?.agentIds).toEqual(
      expect.arrayContaining(["agent:workout", "agent:recovery"]),
    );
    expect(started.snapshot?.context).not.toBeNull();
    expect(started.summary?.statistics.turnCount).toBe(1);

    const continued = continueSession({
      service,
      request: createSessionRequest({
        id: "request:continue:1",
        kind: SessionRequestKinds.CONTINUE,
        sessionId,
        message: "Add recovery focus",
        intent: "Recovery focus",
      }),
    });
    expect(continued.success).toBe(true);
    expect(continued.context?.history.entries.length).toBe(2);
    expect(continued.snapshot?.timeline?.items.length).toBeGreaterThan(0);

    const ended = endSession({
      service,
      request: createSessionRequest({
        id: "request:end:1",
        kind: SessionRequestKinds.END,
        sessionId,
        message: "",
        intent: "end",
      }),
    });
    expect(ended.success).toBe(true);
    expect(ended.context?.state.status).toBe("completed");
    expect(ended.summary).not.toBeNull();
  });
});
