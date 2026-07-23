import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import type { CoachParsingResult } from "../models/CoachParsingResult";
import type { CoachResponse } from "../models/CoachResponse";
import type { CoachResponsePackage } from "../models/CoachResponsePackage";
import type { CoachResponseSnapshot } from "../models/CoachResponseSnapshot";
import type { CoachValidationIssue } from "../models/CoachValidationIssue";
import { freezePackage } from "../utils/freezeObjects";
import { computeResponseStatistics } from "../utils/responseStatistics";
import { summarizeCoachResponse } from "../utils/summarizeResponse";
import { freezeSnapshot } from "../utils/freezeObjects";

/**
 * Builder for immutable CoachResponsePackage.
 */
export class CoachResponsePackageBuilder {
  private response: CoachResponse | null = null;
  private parsing: CoachParsingResult | null = null;
  private formatting: CoachFormattingResult | null = null;
  private validationIssues: readonly CoachValidationIssue[] = Object.freeze([]);
  private createdAt = "";
  private snapshot: CoachResponseSnapshot | null = null;

  withResponse(response: CoachResponse): this {
    this.response = response;
    return this;
  }

  withParsing(parsing: CoachParsingResult): this {
    this.parsing = parsing;
    return this;
  }

  withFormatting(formatting: CoachFormattingResult | null): this {
    this.formatting = formatting;
    return this;
  }

  withValidationIssues(
    issues: readonly CoachValidationIssue[],
  ): this {
    this.validationIssues = issues;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  withSnapshot(snapshot: CoachResponseSnapshot): this {
    this.snapshot = snapshot;
    return this;
  }

  build(): CoachResponsePackage {
    if (!this.response || !this.parsing || !this.createdAt) {
      throw new Error("CoachResponsePackageBuilder missing required fields");
    }

    const snapshot =
      this.snapshot ??
      freezeSnapshot({
        response: this.response,
        summary: summarizeCoachResponse(this.response),
        statistics: computeResponseStatistics(this.response),
        capturedAt: this.createdAt,
      });

    return freezePackage({
      response: this.response,
      parsing: this.parsing,
      snapshot,
      formatting: this.formatting,
      validationIssues: this.validationIssues,
      createdAt: this.createdAt,
    });
  }
}
