import { createCollaborationDispatcher } from "../dispatch/CollaborationDispatcher";
import { createCollaborationPlanner } from "../planning/CollaborationPlanner";
import {
  createCoachRequest,
  createFailingHandler,
  createFixedClock,
  createFixedNowMs,
  createTrackingHandler,
} from "../testSupport/fixtures";

describe("agent-collaboration dispatch", () => {
  it("invokes participants in deterministic order", async () => {
    const planner = createCollaborationPlanner();
    const request = createCoachRequest();
    const plan = planner.plan({
      request,
      collaborationId: "collaboration:dispatch",
      clock: createFixedClock(),
    });

    const callOrder: string[] = [];
    const dispatcher = createCollaborationDispatcher({
      handlers: new Map([
        ["agent:workout", createTrackingHandler("workout", callOrder)],
        ["agent:nutrition", createTrackingHandler("nutrition", callOrder)],
        ["agent:recovery", createTrackingHandler("recovery", callOrder)],
      ]),
    });

    const results = await dispatcher.dispatch({
      request,
      plan,
      collaborationId: "collaboration:dispatch",
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
    });

    expect(callOrder).toEqual(["workout", "nutrition", "recovery"]);
    expect(results.every((r) => r.success)).toBe(true);
    expect(results.map((r) => r.order)).toEqual([1, 2, 3]);
  });

  it("stops on first error when stopOnError is true", async () => {
    const planner = createCollaborationPlanner();
    const request = createCoachRequest();
    const plan = planner.plan({
      request,
      collaborationId: "collaboration:dispatch-fail",
      clock: createFixedClock(),
    });

    const callOrder: string[] = [];
    const dispatcher = createCollaborationDispatcher({
      handlers: new Map([
        ["agent:workout", createFailingHandler("boom")],
        ["agent:nutrition", createTrackingHandler("nutrition", callOrder)],
        ["agent:recovery", createTrackingHandler("recovery", callOrder)],
      ]),
    });

    const results = await dispatcher.dispatch({
      request,
      plan,
      collaborationId: "collaboration:dispatch-fail",
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
      stopOnError: true,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.success).toBe(false);
    expect(callOrder).toEqual([]);
  });

  it("continues after errors when stopOnError is false", async () => {
    const planner = createCollaborationPlanner();
    const request = createCoachRequest();
    const plan = planner.plan({
      request,
      collaborationId: "collaboration:dispatch-continue",
      clock: createFixedClock(),
    });

    const callOrder: string[] = [];
    const dispatcher = createCollaborationDispatcher({
      handlers: new Map([
        ["agent:workout", createFailingHandler("boom")],
        ["agent:nutrition", createTrackingHandler("nutrition", callOrder)],
        ["agent:recovery", createTrackingHandler("recovery", callOrder)],
      ]),
    });

    const results = await dispatcher.dispatch({
      request,
      plan,
      collaborationId: "collaboration:dispatch-continue",
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
      stopOnError: false,
    });

    expect(results).toHaveLength(3);
    expect(results[0]?.success).toBe(false);
    expect(callOrder).toEqual(["nutrition", "recovery"]);
  });

  it("propagates thrown handler errors as failed results", async () => {
    const planner = createCollaborationPlanner();
    const request = createCoachRequest({
      requestedRoles: ["workout" as const],
    });
    const plan = planner.plan({
      request,
      collaborationId: "collaboration:dispatch-throw",
      clock: createFixedClock(),
    });

    const dispatcher = createCollaborationDispatcher({
      handlers: new Map([
        [
          "agent:workout",
          () => {
            throw new Error("handler exploded");
          },
        ],
      ]),
    });

    const results = await dispatcher.dispatch({
      request,
      plan,
      collaborationId: "collaboration:dispatch-throw",
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.success).toBe(false);
    expect(results[0]?.message).toBe("handler exploded");
    expect(results[0]?.error?.code).toBe("dispatch_failed");
  });
});
