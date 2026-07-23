import { createCollaborationEngine } from "../execution/CollaborationEngine";
import { CollaborationOperationKinds } from "../models/CollaborationResult";
import { CollaborationRoles } from "../models/CollaborationRole";
import {
  createCoachRequest,
  createFailingHandler,
  createFixedClock,
  createFixedNowMs,
  createTrackingHandler,
} from "../testSupport/fixtures";

describe("agent-collaboration execution", () => {
  it("coordinates plan → dispatch → aggregate lifecycle", async () => {
    const callOrder: string[] = [];
    const engine = createCollaborationEngine({
      collaborationId: "collaboration:exec",
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
      handlers: new Map([
        ["agent:workout", createTrackingHandler("workout", callOrder)],
        ["agent:nutrition", createTrackingHandler("nutrition", callOrder)],
      ]),
    });

    const result = await engine.execute(
      createCoachRequest({
        requestedRoles: [
          CollaborationRoles.WORKOUT,
          CollaborationRoles.NUTRITION,
        ],
      }),
    );

    expect(result.success).toBe(true);
    expect(result.operation).toBe(CollaborationOperationKinds.EXECUTE);
    expect(callOrder).toEqual(["workout", "nutrition"]);
    expect(result.aggregation?.provenance).toEqual([
      "1:agent:workout:task:plan:collaboration:exec:agent:workout:ok",
      "2:agent:nutrition:task:plan:collaboration:exec:agent:nutrition:ok",
    ]);
    expect(result.events.some((e) => e.type === "completed")).toBe(true);
  });

  it("records failure status when a required specialist fails", async () => {
    const engine = createCollaborationEngine({
      collaborationId: "collaboration:exec-fail",
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
      stopOnError: true,
      handlers: new Map([
        ["agent:workout", createFailingHandler("nope")],
      ]),
    });

    const result = await engine.execute(
      createCoachRequest({
        requestedRoles: [
          CollaborationRoles.WORKOUT,
          CollaborationRoles.NUTRITION,
        ],
      }),
    );

    expect(result.success).toBe(false);
    expect(result.results).toHaveLength(1);
    expect(result.status).toBe("failed");
  });

  it("builds snapshot after execution", async () => {
    const engine = createCollaborationEngine({
      collaborationId: "collaboration:snapshot",
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
    });

    await engine.execute(
      createCoachRequest({
        requestedRoles: [CollaborationRoles.RECOVERY],
      }),
    );

    const snapshot = engine.buildSnapshot({ snapshotId: "snap:1" });
    expect(snapshot.success).toBe(true);
    expect(snapshot.snapshot?.id).toBe("snap:1");
    expect(snapshot.snapshot?.resultCount).toBe(1);
  });
});
