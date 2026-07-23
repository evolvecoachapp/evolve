import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { IStreamSourceResolver } from "../contracts/IStreamSource";
import type { StreamCancellation } from "../models/StreamCancellation";
import type { StreamMetadata } from "../models/StreamMetadata";
import type { StreamSnapshot } from "../models/StreamSnapshot";
import type { StreamState } from "../models/StreamState";
import type { StreamSummary } from "../models/StreamSummary";
import type { StreamingEngineDeps } from "../engine/StreamingEngine";
import {
  createStreamingService,
  type StreamingService,
} from "../services/StreamingService";

function resolveService(
  service?: StreamingService,
  deps?: StreamingEngineDeps,
): StreamingService {
  if (service) {
    return service;
  }
  if (!deps?.sourceResolver) {
    throw new Error(
      "startStream requires a StreamingService or sourceResolver",
    );
  }
  return createStreamingService(deps);
}

/**
 * Public API — start a provider-agnostic stream.
 *
 * Does not expose engine / handler internals.
 */
export async function startStream(options: {
  readonly providerId: AIProviderId;
  readonly modelId?: string | null;
  readonly executionRequestId?: string | null;
  readonly metadata?: StreamMetadata;
  readonly cancellation?: StreamCancellation;
  readonly requestId?: string;
  readonly createdAt?: string;
  readonly service?: StreamingService;
  readonly sourceResolver?: IStreamSourceResolver;
  readonly clock?: StreamingEngineDeps["clock"];
}): Promise<StreamSnapshot> {
  const { service, sourceResolver, clock, ...input } = options;
  const resolved = resolveService(
    service,
    sourceResolver ? { sourceResolver, clock } : undefined,
  );
  return resolved.startStream(input);
}

/**
 * Public API — cancel an active stream by id.
 */
export function cancelStream(options: {
  readonly streamId: string;
  readonly reason?: string | null;
  readonly service?: StreamingService;
  readonly sourceResolver?: IStreamSourceResolver;
  readonly clock?: StreamingEngineDeps["clock"];
}): boolean {
  const { service, sourceResolver, clock, streamId, reason } = options;
  const resolved = resolveService(
    service,
    sourceResolver ? { sourceResolver, clock } : undefined,
  );
  return resolved.cancelStream(streamId, reason ?? null);
}

/**
 * Public API — summarize stream state or snapshot.
 */
export function summarizeStream(options: {
  readonly state?: StreamState;
  readonly snapshot?: StreamSnapshot;
  readonly providerId?: AIProviderId | null;
  readonly service?: StreamingService;
  readonly sourceResolver?: IStreamSourceResolver;
}): StreamSummary {
  const { service, sourceResolver, state, snapshot, providerId } = options;
  const target = snapshot ?? state;
  if (!target) {
    throw new Error("summarizeStream requires state or snapshot");
  }
  const resolved = resolveService(
    service,
    sourceResolver ? { sourceResolver } : undefined,
  );
  return resolved.summarizeStream(target, providerId ?? null);
}
