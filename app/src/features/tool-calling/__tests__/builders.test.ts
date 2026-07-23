import { ToolCallBuilder } from "../builders/ToolCallBuilder";
import { ToolCallRequestBuilder } from "../builders/ToolCallRequestBuilder";
import { ToolExecutionContextBuilder } from "../builders/ToolExecutionContextBuilder";
import { ToolResultBuilder } from "../builders/ToolResultBuilder";
import { createToolExecutionError } from "../models/ToolExecutionError";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("tool-calling builders", () => {
  it("builds an immutable ToolCall", () => {
    const call = new ToolCallBuilder()
      .withId("call-1")
      .withToolId("Echo-Tool")
      .withParameters({ message: "hi" })
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(call.toolId).toBe("echo_tool");
    expect(Object.isFrozen(call)).toBe(true);
    expect(Object.isFrozen(call.input)).toBe(true);
  });

  it("builds ToolExecutionContext and ToolCallRequest", () => {
    const context = new ToolExecutionContextBuilder()
      .withConversationId("c1")
      .withStreamId("stream:1")
      .withExecutionRequestId("exec:1")
      .withNow(FIXED_TIMESTAMP)
      .build();

    const request = new ToolCallRequestBuilder()
      .withId("req-1")
      .withCreatedAt(FIXED_TIMESTAMP)
      .withContext(context)
      .withToolCall({ toolId: "echo", parameters: { message: "x" } })
      .build();

    expect(request.context.streamId).toBe("stream:1");
    expect(request.call.toolId).toBe("echo");
    expect(Object.isFrozen(request)).toBe(true);
  });

  it("builds succeeded and failed ToolExecutionResult", () => {
    const ok = new ToolResultBuilder().succeeded({ value: 1 }).build();
    expect(ok.status).toBe("succeeded");
    expect(ok.output?.data).toEqual({ value: 1 });

    const failed = new ToolResultBuilder()
      .failed(createToolExecutionError("x", "fail"))
      .build();
    expect(failed.status).toBe("failed");
    expect(failed.error?.code).toBe("x");
  });

  it("throws when required builder fields are missing", () => {
    expect(() => new ToolCallBuilder().build()).toThrow(/missing required/);
    expect(() => new ToolExecutionContextBuilder().build()).toThrow(
      /missing required/,
    );
  });
});
