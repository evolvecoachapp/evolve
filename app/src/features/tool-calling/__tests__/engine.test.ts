import {
  createEchoTool,
  createTestToolCallingHarness,
  createToolCallRequest,
} from "../testSupport/fixtures";
import { FoundationToolRegistry } from "../registry/InMemoryToolRegistry";
import { createToolCallingEngine } from "../engine/ToolCallingEngine";

describe("ToolCallingEngine", () => {
  it("validates, resolves, executes, and returns ToolEngineResult", async () => {
    const { engine } = createTestToolCallingHarness();
    const request = createToolCallRequest({
      parameters: { message: "world" },
    });

    const result = await engine.execute(request);

    expect(result.response.status).toBe("succeeded");
    expect(result.result.output?.data).toEqual({ echo: "world" });
    expect(result.descriptor?.id).toBe("echo");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.execution)).toBe(true);
  });

  it("returns failed result when tool is missing", async () => {
    const { engine } = createTestToolCallingHarness();
    const request = createToolCallRequest({ toolId: "missing_tool" });

    const result = await engine.execute(request);

    expect(result.response.status).toBe("failed");
    expect(result.result.error?.code).toBe("tool_not_found");
    expect(result.validationIssues).toContain("tool_not_found");
  });

  it("returns failed result for invalid request", async () => {
    const { engine } = createTestToolCallingHarness();
    const request = createToolCallRequest();
    const invalid = Object.freeze({
      ...request,
      id: "",
    });

    const result = await engine.execute(invalid);

    expect(result.response.status).toBe("failed");
    expect(result.result.error?.code).toBe("invalid_request");
  });

  it("lists and describes tools", () => {
    const { engine } = createTestToolCallingHarness({
      tools: [createEchoTool(), createEchoTool({ id: "echo_two" })],
    });

    expect(engine.listTools()).toHaveLength(2);
    expect(engine.describeTool("echo")?.name).toBe("echo");
    expect(engine.describeTool("missing")).toBeNull();
  });

  it("accepts an injected executor", async () => {
    const registry = new FoundationToolRegistry();
    registry.register(createEchoTool());
    registry.freeze();

    const engine = createToolCallingEngine({
      registry,
      clock: () => "2026-07-23T00:00:00.000Z",
    });

    const result = await engine.execute(
      createToolCallRequest({ parameters: { message: "ok" } }),
    );
    expect(result.response.status).toBe("succeeded");
  });
});
