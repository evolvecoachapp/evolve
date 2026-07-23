import type { CoachResponse } from "../models/CoachResponse";
import type { CoachSummary } from "../models/CoachSummary";
import { summarizeCoachResponse } from "../utils/summarizeResponse";

/**
 * Builder for immutable CoachSummary.
 */
export class CoachSummaryBuilder {
  private response: CoachResponse | null = null;

  withResponse(response: CoachResponse): this {
    this.response = response;
    return this;
  }

  build(): CoachSummary {
    if (!this.response) {
      throw new Error("CoachSummaryBuilder requires a CoachResponse");
    }
    return summarizeCoachResponse(this.response);
  }
}
