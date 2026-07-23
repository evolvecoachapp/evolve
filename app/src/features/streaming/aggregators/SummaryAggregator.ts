import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamState } from "../models/StreamState";
import type { StreamSummary } from "../models/StreamSummary";
import { summarizeStreamState } from "../utils/summarizeStream";

/**
 * Aggregate a compact stream summary from state. No business logic.
 */
export class SummaryAggregator {
  summarize(
    state: StreamState,
    providerId: AIProviderId | null = null,
  ): StreamSummary {
    return summarizeStreamState(state, providerId);
  }
}

export function createSummaryAggregator(): SummaryAggregator {
  return new SummaryAggregator();
}
