import type { WeeklyCoachReport } from "../models/WeeklyCoachReport";
import type { WeeklyReportValidation } from "../models/WeeklyReportResult";

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

/**
 * Validate a Weekly Coach Report is complete, consistent, and immutable.
 */
export function validateWeeklyCoachReport(
  report: WeeklyCoachReport | null | undefined,
): WeeklyReportValidation {
  const errors: string[] = [];

  if (!report) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Weekly coach report is missing"]),
    });
  }

  if (!report.id) errors.push("Report id is required");
  if (!report.athleteId) errors.push("Report athleteId is required");
  if (!report.timestamp) errors.push("Report timestamp is required");
  if (!report.weekStart) errors.push("Report weekStart is required");
  if (!report.weekEnd) errors.push("Report weekEnd is required");
  if (!report.executiveSummary) errors.push("Report executiveSummary is required");
  if (!report.workout) errors.push("Report workout section is required");
  if (!report.nutrition) errors.push("Report nutrition section is required");
  if (!report.recovery) errors.push("Report recovery section is required");
  if (!report.goals) errors.push("Report goals section is required");
  if (!report.insights) errors.push("Report insights section is required");
  if (!report.decisions) errors.push("Report decisions section is required");
  if (!report.recommendations) {
    errors.push("Report recommendations section is required");
  }
  if (!report.evidence) errors.push("Report evidence is required");
  if (!report.confidence) errors.push("Report confidence is required");
  if (!report.relatedDomains) errors.push("Report relatedDomains are required");
  if (!report.metadata) errors.push("Report metadata is required");

  if (report.executiveSummary) {
    if (report.executiveSummary.athleteId !== report.athleteId) {
      errors.push("Executive summary athleteId must match report athleteId");
    }
    if (report.executiveSummary.insightCount !== report.insights.items.length) {
      errors.push(
        "Executive summary insightCount must match insights items length",
      );
    }
    if (
      report.executiveSummary.decisionCount !== report.decisions.decisionCount
    ) {
      errors.push(
        "Executive summary decisionCount must match decisions.decisionCount",
      );
    }
    if (
      report.executiveSummary.confidence.score !== report.confidence.score
    ) {
      errors.push(
        "Executive summary confidence must match report confidence",
      );
    }
    if (!isFrozen(report.executiveSummary)) {
      errors.push("executiveSummary must be immutable");
    }
  }

  if (report.workout && !isFrozen(report.workout)) {
    errors.push("workout section must be immutable");
  }
  if (report.nutrition && !isFrozen(report.nutrition)) {
    errors.push("nutrition section must be immutable");
  }
  if (report.recovery && !isFrozen(report.recovery)) {
    errors.push("recovery section must be immutable");
  }
  if (report.goals && !isFrozen(report.goals)) {
    errors.push("goals section must be immutable");
  }
  if (report.insights && !isFrozen(report.insights)) {
    errors.push("insights section must be immutable");
  }
  if (report.decisions && !isFrozen(report.decisions)) {
    errors.push("decisions section must be immutable");
  }
  if (report.recommendations && !isFrozen(report.recommendations)) {
    errors.push("recommendations section must be immutable");
  }
  if (report.evidence && !isFrozen(report.evidence)) {
    errors.push("evidence must be immutable");
  }
  if (report.confidence && !isFrozen(report.confidence)) {
    errors.push("confidence must be immutable");
  }
  if (!isFrozen(report)) {
    errors.push("Report must be immutable (Object.freeze)");
  }

  if (
    report.confidence &&
    (report.confidence.score < 0 || report.confidence.score > 1)
  ) {
    errors.push("confidence.score must be between 0 and 1");
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertWeeklyCoachReportImmutable(
  report: WeeklyCoachReport,
): void {
  if (!Object.isFrozen(report)) {
    throw new Error("WeeklyCoachReport must be frozen");
  }
}
