import type { ChunkAggregator } from "../aggregators/ChunkAggregator";
import type { TokenAggregator } from "../aggregators/TokenAggregator";
import type { StreamChunk } from "../models/StreamChunk";
import type { StreamErrorSnapshot } from "../models/StreamError";
import type { StreamEvent } from "../models/StreamEvent";
import type { StreamRequest } from "../models/StreamRequest";
import type { StreamState } from "../models/StreamState";
import type { StreamToken } from "../models/StreamToken";

/**
 * Mutable working context for a single stream run (frozen at boundaries).
 */
export interface StreamWorkingContext {
  request: StreamRequest;
  state: StreamState;
  chunkAggregator: ChunkAggregator;
  tokenAggregator: TokenAggregator;
  pendingEvents: StreamEvent[];
  lastChunk: StreamChunk | null;
  lastTokens: readonly StreamToken[];
  error: StreamErrorSnapshot | null;
  now: string;
  startedAt: string;
  cancelled: boolean;
  cancelReason: string | null;
}

export interface StreamHandler {
  readonly name: string;
  handle(context: StreamWorkingContext): StreamWorkingContext;
}
