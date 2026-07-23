import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ToolEngineResult } from "../models/ToolEngineResult";
import type { ToolRegistrySnapshot } from "../models/ToolRegistrySnapshot";

export interface ToolCallSummary {
  readonly toolId: string;
  readonly status: string;
  readonly succeeded: boolean;
  readonly failed: boolean;
  readonly durationMs: number | null;
  readonly issueCount: number;
}

export function summarizeEngineResult(
  result: ToolEngineResult,
): ToolCallSummary {
  return Object.freeze({
    toolId: result.response.toolId,
    status: result.response.status,
    succeeded: result.response.status === "succeeded",
    failed: result.response.status === "failed",
    durationMs: result.result.durationMs,
    issueCount: result.validationIssues.length,
  });
}

export function summarizeRegistry(
  snapshot: ToolRegistrySnapshot,
): Readonly<{
  toolCount: number;
  frozen: boolean;
  categoryCount: number;
  capabilityCount: number;
}> {
  return Object.freeze({
    toolCount: snapshot.toolCount,
    frozen: snapshot.frozen,
    categoryCount: snapshot.categories.length,
    capabilityCount: snapshot.capabilities.length,
  });
}

export function summarizeDescriptor(
  descriptor: ToolDescriptor,
): Readonly<{
  id: string;
  category: string;
  capabilityCount: number;
}> {
  return Object.freeze({
    id: descriptor.id,
    category: descriptor.category,
    capabilityCount: descriptor.capabilities.length,
  });
}
