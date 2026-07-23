import { AdapterContextBuilder } from "../builders/AdapterContextBuilder";
import { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import { createExecutionContext, FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("domain-tools builders", () => {
  it("FoundationToolResultBuilder builds succeeded immutable result", () => {
    const result = new FoundationToolResultBuilder()
      .fromRequest({
        requestId: "req-1",
        callId: "call-1",
        toolId: "domain.workout.generate",
        completedAt: FIXED_TIMESTAMP,
        durationMs: 12,
      })
      .succeeded({ ok: true })
      .build();

    expect(result.status).toBe("succeeded");
    expect(result.output?.data).toEqual({ ok: true });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("FoundationToolResultBuilder builds failed result", () => {
    const result = new FoundationToolResultBuilder()
      .fromRequest({
        requestId: "req-1",
        callId: "call-1",
        toolId: "domain.workout.generate",
        completedAt: FIXED_TIMESTAMP,
      })
      .failed("invalid_parameters", "bad input", { issues: ["x"] })
      .build();

    expect(result.status).toBe("failed");
    expect(result.error?.code).toBe("invalid_parameters");
    expect(result.output).toBeNull();
  });

  it("AdapterContextBuilder builds immutable adapter context", () => {
    const context = new AdapterContextBuilder()
      .withAdapterId("adapter.workout")
      .withDomain("workout")
      .withToolId("domain.workout.generate")
      .withExecutionContext(createExecutionContext())
      .build();

    expect(context.adapterId).toBe("adapter.workout");
    expect(context.domain).toBe("workout");
    expect(Object.isFrozen(context)).toBe(true);
  });

  it("AdapterContextBuilder requires execution context", () => {
    expect(() =>
      new AdapterContextBuilder().withAdapterId("a").build(),
    ).toThrow(/requires executionContext/);
  });
});
