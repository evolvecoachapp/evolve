import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyContinuationPolicy } from "../policies/ContinuationPolicy";
import { applyLifecyclePolicy } from "../policies/LifecyclePolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { SessionRequestKinds } from "../models/SessionRequest";
import { SessionStatuses } from "../models/SessionState";
import { createSessionRequest } from "../testSupport/fixtures";

describe("coaching-session policies", () => {
  it("enforces safety / lifecycle / continuation policies", () => {
    const safety = applySafetyPolicy(
      createSessionRequest({ id: "", intent: "" }),
    );
    expect(safety.valid).toBe(false);

    const lifecycle = applyLifecyclePolicy({
      request: createSessionRequest({
        kind: SessionRequestKinds.CONTINUE,
        sessionId: "session:1",
      }),
      currentStatus: SessionStatuses.COMPLETED,
    });
    expect(lifecycle.valid).toBe(false);

    const continuation = applyContinuationPolicy(
      createSessionRequest({
        kind: SessionRequestKinds.END,
        sessionId: null,
      }),
    );
    expect(continuation.valid).toBe(false);
  });

  it("checks consistency when response session mismatches", () => {
    const result = applyConsistencyPolicy({
      context: {
        id: "ctx",
        sessionId: "session:a",
        conversationId: null,
        athleteId: null,
        request: null,
        state: {
          id: "s",
          sessionId: "session:a",
          status: SessionStatuses.ACTIVE,
          phase: "interact",
          turnCount: 1,
          lastRequestId: null,
          errorMessage: null,
          metadata: { tags: [], attributes: {} },
          updatedAt: "",
        },
        lifecycle: {
          id: "l",
          sessionId: "session:a",
          stage: "started",
          status: SessionStatuses.ACTIVE,
          phase: "interact",
          startedAt: "",
          endedAt: null,
          metadata: { tags: [], attributes: {} },
          updatedAt: "",
        },
        history: {
          id: "h",
          sessionId: "session:a",
          entries: [],
          events: [],
          metadata: { tags: [], attributes: {} },
          createdAt: "",
          updatedAt: "",
        },
        checkpoint: null,
        metadata: { tags: [], attributes: {} },
        createdAt: "",
        frozenAt: "",
      },
      response: {
        id: "r",
        sessionId: "session:b",
        requestId: "req",
        message: "x",
        sections: [],
        agentIds: [],
        capabilityIds: [],
        confidence: { level: "high", score: 1, rationale: null },
        diagnostics: {
          id: "d",
          warnings: [],
          notes: [],
          metadata: { tags: [], attributes: {} },
          createdAt: "",
        },
        metadata: { tags: [], attributes: {} },
        createdAt: "",
        frozenAt: "",
      },
    });
    expect(result.valid).toBe(false);
  });
});
