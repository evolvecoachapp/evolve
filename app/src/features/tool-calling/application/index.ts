import type { IToolRegistry } from "../contracts/IToolRegistry";
import type { ToolCallingEngineDeps } from "../engine/ToolCallingEngine";
import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ToolEngineResult } from "../models/ToolEngineResult";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import type { ToolRegistrySnapshot } from "../models/ToolRegistrySnapshot";
import {
  createToolCallingService,
  type ToolCallingService,
} from "../services/ToolCallingService";

export { executeToolRequest } from "./executeToolRequest";

function resolveService(
  service?: ToolCallingService,
  deps?: ToolCallingEngineDeps,
): ToolCallingService {
  if (service) {
    return service;
  }
  if (!deps?.registry) {
    throw new Error("executeTool requires a ToolCallingService or registry");
  }
  return createToolCallingService(deps);
}

/**
 * Public API — execute a tool call through the Tool Calling Foundation.
 *
 * Does not expose engine / executor internals.
 */
export async function executeTool(options: {
  readonly toolId: string;
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly context?: Partial<ToolExecutionContext> | ToolExecutionContext;
  readonly metadata?: ToolExecutionMetadata;
  readonly requestId?: string;
  readonly callId?: string;
  readonly createdAt?: string;
  readonly request?: ToolCallRequest;
  readonly service?: ToolCallingService;
  readonly registry?: IToolRegistry;
  readonly clock?: ToolCallingEngineDeps["clock"];
}): Promise<ToolEngineResult> {
  const { service, registry, clock, request, ...input } = options;
  const resolved = resolveService(
    service,
    registry ? { registry, clock } : undefined,
  );

  if (request) {
    return resolved.executeRequest(request);
  }

  return resolved.executeTool(input);
}

/**
 * Public API — list registered tool descriptors.
 */
export function listTools(options: {
  readonly service?: ToolCallingService;
  readonly registry?: IToolRegistry;
  readonly clock?: ToolCallingEngineDeps["clock"];
}): readonly ToolDescriptor[] {
  const { service, registry, clock } = options;
  const resolved = resolveService(
    service,
    registry ? { registry, clock } : undefined,
  );
  return resolved.listTools();
}

/**
 * Public API — describe a single registered tool.
 */
export function describeTool(options: {
  readonly toolId: string;
  readonly service?: ToolCallingService;
  readonly registry?: IToolRegistry;
  readonly clock?: ToolCallingEngineDeps["clock"];
}): ToolDescriptor | null {
  const { service, registry, clock, toolId } = options;
  const resolved = resolveService(
    service,
    registry ? { registry, clock } : undefined,
  );
  return resolved.describeTool(toolId);
}

/**
 * Public API — capture an immutable registry snapshot.
 */
export function snapshotRegistry(options: {
  readonly service?: ToolCallingService;
  readonly registry?: IToolRegistry;
  readonly capturedAt?: string;
  readonly clock?: ToolCallingEngineDeps["clock"];
}): ToolRegistrySnapshot {
  const { service, registry, clock, capturedAt } = options;
  const resolved = resolveService(
    service,
    registry ? { registry, clock } : undefined,
  );
  return resolved.registrySnapshot(capturedAt);
}
