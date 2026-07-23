import { createFoundationToolExecutor } from "../executor/ToolExecutor";
import {
  createEchoTool,
  createExecutionContext,
  createToolCallRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("FoundationToolExecutor", () => {
  it("executes a tool and returns an immutable succeeded result", async () => {
    const executor = createFoundationToolExecutor({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1000,
    });
    const tool = createEchoTool();
    const request = createToolCallRequest({
      parameters: { message: "hi" },
    });

    const result = await executor.execute(
      tool,
      request.call,
      createExecutionContext(),
      request.id,
    );

    expect(result.status).toBe("succeeded");
    expect(result.output?.data).toEqual({ echo: "hi" });
    expect(result.error).toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("returns failed result for invalid parameters", async () => {
    const executor = createFoundationToolExecutor({
      clock: () => FIXED_TIMESTAMP,
    });
    const tool = createEchoTool();
    const request = createToolCallRequest({ parameters: {} });

    const result = await executor.execute(
      tool,
      request.call,
      createExecutionContext(),
      request.id,
    );

    expect(result.status).toBe("failed");
    expect(result.error?.code).toBe("invalid_parameters");
    expect(result.output).toBeNull();
  });

  it("returns failed result when tool throws", async () => {
    const executor = createFoundationToolExecutor({
      clock: () => FIXED_TIMESTAMP,
    });
    const tool = createEchoTool({ fail: true });
    const request = createToolCallRequest({
      parameters: { message: "x" },
    });

    const result = await executor.execute(
      tool,
      request.call,
      createExecutionContext(),
      request.id,
    );

    expect(result.status).toBe("failed");
    expect(result.error?.code).toBe("execution_failed");
  });
});
