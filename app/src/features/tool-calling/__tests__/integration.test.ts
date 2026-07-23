import { executeTool, listTools } from "../application";
import { createEchoTool, createTestToolCallingHarness } from "../testSupport/fixtures";
import { summarizeEngineResult } from "../utils/summarizeTool";

describe("tool-calling integration", () => {
  it("runs Streaming/Execution-linked context through the foundation", async () => {
    const { service } = createTestToolCallingHarness({
      tools: [createEchoTool()],
    });

    const result = await executeTool({
      service,
      toolId: "echo",
      parameters: { message: "linked" },
      context: {
        conversationId: "conv-9",
        athleteId: "athlete-9",
        streamId: "stream:abc",
        executionRequestId: "exec-req:abc",
        now: "2026-07-23T01:00:00.000Z",
        attributes: { source: "integration" },
      },
    });

    expect(result.response.status).toBe("succeeded");
    expect(result.execution.context?.streamId).toBe("stream:abc");
    expect(result.execution.context?.executionRequestId).toBe("exec-req:abc");
    expect(listTools({ service }).map((t) => t.id)).toEqual(["echo"]);

    const summary = summarizeEngineResult(result);
    expect(summary.succeeded).toBe(true);
    expect(summary.toolId).toBe("echo");
  });

  it("keeps LLM request / domain execution boundary", async () => {
    const { service } = createTestToolCallingHarness();

    // LLM only supplies toolId + parameters (request). Domain tool returns data.
    const result = await executeTool({
      service,
      toolId: "echo",
      parameters: { message: "boundary" },
    });

    expect(result.request.call.toolId).toBe("echo");
    expect(result.result.output?.data).toEqual({ echo: "boundary" });
    expect(result.response.requestId).toBe(result.request.id);
  });
});
