import type { FoundationToolResult } from "../models/FoundationToolResult";
import type { ToolCall } from "../models/ToolCall";
import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolCallResponse } from "../models/ToolCallResponse";
import type { ToolDefinition } from "../models/ToolDefinition";
import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ToolEngineResult } from "../models/ToolEngineResult";
import type { ToolExecution } from "../models/ToolExecution";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionError } from "../models/ToolExecutionError";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolInput } from "../models/ToolInput";
import type { ToolOutput } from "../models/ToolOutput";
import type { ToolParameter } from "../models/ToolParameter";
import type { ToolRegistrySnapshot } from "../models/ToolRegistrySnapshot";
import type { ToolSchema } from "../models/ToolSchema";

export function freezeInput(input: ToolInput): ToolInput {
  return Object.freeze({
    parameters: Object.freeze({ ...input.parameters }),
  });
}

export function freezeOutput(output: ToolOutput): ToolOutput {
  return Object.freeze({ data: output.data });
}

export function freezeParameter(parameter: ToolParameter): ToolParameter {
  return Object.freeze({ ...parameter });
}

export function freezeSchema(schema: ToolSchema): ToolSchema {
  return Object.freeze({
    parameters: Object.freeze(schema.parameters.map(freezeParameter)),
    returns: schema.returns,
  });
}

export function freezeMetadata(
  metadata: ToolExecutionMetadata,
): ToolExecutionMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
    version: metadata.version,
  });
}

export function freezeContext(
  context: ToolExecutionContext,
): ToolExecutionContext {
  return Object.freeze({
    ...context,
    attributes: Object.freeze({ ...context.attributes }),
  });
}

export function freezeExecutionError(
  error: ToolExecutionError,
): ToolExecutionError {
  return Object.freeze({
    ...error,
    details: Object.freeze({ ...error.details }),
  });
}

export function freezeExecutionResult(
  result: ToolExecutionResult,
): ToolExecutionResult {
  return Object.freeze({
    output: result.output ? freezeOutput(result.output) : null,
    error: result.error ? freezeExecutionError(result.error) : null,
    status: result.status,
    durationMs: result.durationMs,
  });
}

export function freezeCall(call: ToolCall): ToolCall {
  return Object.freeze({
    ...call,
    input: freezeInput(call.input),
  });
}

export function freezeCallRequest(request: ToolCallRequest): ToolCallRequest {
  return Object.freeze({
    ...request,
    call: freezeCall(request.call),
    context: freezeContext(request.context),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeCallResponse(
  response: ToolCallResponse,
): ToolCallResponse {
  return Object.freeze({
    ...response,
    result: freezeExecutionResult(response.result),
  });
}

export function freezeDefinition(definition: ToolDefinition): ToolDefinition {
  return Object.freeze({
    ...definition,
    capabilities: Object.freeze([...definition.capabilities]),
    schema: freezeSchema(definition.schema),
    metadata: Object.freeze({
      version: definition.metadata.version,
      tags: Object.freeze([...definition.metadata.tags]),
      createdAt: definition.metadata.createdAt,
    }),
  });
}

export function freezeDescriptor(descriptor: ToolDescriptor): ToolDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
  });
}

export function freezeExecution(execution: ToolExecution): ToolExecution {
  return Object.freeze({
    ...execution,
    context: execution.context ? freezeContext(execution.context) : null,
    result: execution.result ? freezeExecutionResult(execution.result) : null,
  });
}

export function freezeFoundationResult(
  result: FoundationToolResult,
): FoundationToolResult {
  return Object.freeze({
    ...result,
    output: result.output ? freezeOutput(result.output) : null,
    error: result.error ? freezeExecutionError(result.error) : null,
  });
}

export function freezeRegistrySnapshot(
  snapshot: ToolRegistrySnapshot,
): ToolRegistrySnapshot {
  return Object.freeze({
    ...snapshot,
    descriptors: Object.freeze(snapshot.descriptors.map(freezeDescriptor)),
    categories: Object.freeze([...snapshot.categories]),
    capabilities: Object.freeze([...snapshot.capabilities]),
  });
}

export function freezeEngineResult(result: ToolEngineResult): ToolEngineResult {
  return Object.freeze({
    request: freezeCallRequest(result.request),
    response: freezeCallResponse(result.response),
    execution: freezeExecution(result.execution),
    result: freezeExecutionResult(result.result),
    descriptor: result.descriptor
      ? freezeDescriptor(result.descriptor)
      : null,
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
