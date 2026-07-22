import type { InsightSeverity } from "../models/InsightSeverity";
import type { InsightType } from "../models/InsightType";

export function formatInsightType(type: InsightType): string {
  return type.replace(/_/g, " ");
}

export function formatSeverityLabel(severity: InsightSeverity): string {
  switch (severity) {
    case "info":
      return "Info";
    case "notable":
      return "Notable";
    case "elevated":
      return "Elevated";
    case "critical":
      return "Critical";
    default:
      return severity;
  }
}

export function formatCountPhrase(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
