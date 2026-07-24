import { createContinuationPlanner } from "../planning/ContinuationPlanner";
import { createContextPlanner } from "../planning/ContextPlanner";
import { createInteractionPlanner } from "../planning/InteractionPlanner";
import { createResponsePlanner } from "../planning/ResponsePlanner";
import { createSessionPlanner } from "../planning/SessionPlanner";
import { SessionDecisionKinds } from "../models/SessionDecision";
import { SessionRequestKinds } from "../models/SessionRequest";
import {
  createSessionRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coaching-session planning", () => {
  it("plans start / continue / end decisions deterministically", () => {
    const planner = createSessionPlanner();
    const start = planner.plan({
      request: createSessionRequest({ kind: SessionRequestKinds.START }),
      decisionId: "d1",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(start.kind).toBe(SessionDecisionKinds.START);

    const cont = createContinuationPlanner().plan({
      request: createSessionRequest({
        kind: SessionRequestKinds.CONTINUE,
        sessionId: "session:1",
      }),
      decisionId: "d2",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(cont.kind).toBe(SessionDecisionKinds.CONTINUE);
  });

  it("plans interaction / context / response without AI", () => {
    const request = createSessionRequest();
    const action = createInteractionPlanner().plan({
      actionId: "a1",
      sessionId: "session:1",
      request,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(action.kind).toBe("supervise");

    const ctx = createContextPlanner().plan({
      request,
      sessionId: "session:1",
    });
    expect(ctx.retainHistory).toBe(true);

    const resp = createResponsePlanner().plan({
      success: true,
      message: "ok",
      responseMessage: "hello",
      sections: ["overview"],
      agentIds: ["agent:workout"],
      capabilityIds: ["capability:generate_workout"],
      confidenceScore: 0.9,
      errorMessage: null,
    });
    expect(resp.includeSections).toBe(true);
  });
});
