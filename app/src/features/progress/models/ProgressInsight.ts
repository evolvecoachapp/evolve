export type ProgressInsightType = "positive" | "neutral" | "action";

/** AI- or rule-driven insight surfaced on the Progress tab. */
export interface ProgressInsight {
  id: string;
  type: ProgressInsightType;
  title: string;
  message: string;
  metric?: string;
}
