import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolDescriptor } from "../../tool-calling/models/ToolDescriptor";
import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";
import {
  createDomainToolService,
  type DomainToolService,
  type DomainToolServiceDeps,
} from "../services/DomainToolService";

function resolveService(
  service?: DomainToolService,
  deps?: DomainToolServiceDeps,
): DomainToolService {
  if (service) {
    return service;
  }
  return createDomainToolService(deps);
}

/**
 * Public API — execute a domain tool through Domain Tool Adapters.
 *
 * Does not expose adapter internals.
 */
export async function executeDomainTool(options: {
  readonly request: ToolCallRequest;
  readonly service?: DomainToolService;
  readonly adapters?: readonly IDomainToolAdapter[];
  readonly clock?: DomainToolServiceDeps["clock"];
  readonly nowMs?: DomainToolServiceDeps["nowMs"];
}): Promise<FoundationToolResult> {
  const { request, service, adapters, clock, nowMs } = options;
  const resolved = resolveService(
    service,
    adapters || clock || nowMs ? { adapters, clock, nowMs } : undefined,
  );
  return resolved.executeDomainTool(request);
}

/**
 * Public API — list domain tool descriptors.
 */
export function listDomainTools(options: {
  readonly service?: DomainToolService;
  readonly adapters?: readonly IDomainToolAdapter[];
  readonly clock?: DomainToolServiceDeps["clock"];
  readonly nowMs?: DomainToolServiceDeps["nowMs"];
} = {}): readonly ToolDescriptor[] {
  const { service, adapters, clock, nowMs } = options;
  const resolved = resolveService(
    service,
    adapters || clock || nowMs ? { adapters, clock, nowMs } : undefined,
  );
  return resolved.listDomainTools();
}

/**
 * Public API — describe a single domain tool.
 */
export function describeDomainTool(options: {
  readonly toolId: string;
  readonly service?: DomainToolService;
  readonly adapters?: readonly IDomainToolAdapter[];
  readonly clock?: DomainToolServiceDeps["clock"];
  readonly nowMs?: DomainToolServiceDeps["nowMs"];
}): ToolDescriptor | null {
  const { toolId, service, adapters, clock, nowMs } = options;
  const resolved = resolveService(
    service,
    adapters || clock || nowMs ? { adapters, clock, nowMs } : undefined,
  );
  return resolved.describeDomainTool(toolId);
}
