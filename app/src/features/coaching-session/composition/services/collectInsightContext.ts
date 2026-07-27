import type { CoachInsight } from "../../../proactive-insights/models/CoachInsight";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";
import type { CoachingSessionInsight } from "../models/CoachingSessionInsight";

/**
 * Collect insight summary from existing Proactive Insights only.
 */
export function collectInsightContext(input: {
  readonly insights?: readonly CoachInsight[];
  readonly evidence?: CoachingSessionEvidence | null;
}): CoachingSessionInsight {
  const insightIds: string[] = [];
  const titles: string[] = [];
  const severities: string[] = [];

  for (const insight of input.insights ?? []) {
    insightIds.push(insight.id);
    titles.push(insight.title);
    severities.push(insight.severity);
  }

  for (const id of input.evidence?.insightIds ?? []) {
    if (!insightIds.includes(id)) insightIds.push(id);
  }

  const present = insightIds.length > 0;
  return Object.freeze({
    insightIds: Object.freeze([...insightIds]),
    titles: Object.freeze(titles.slice(0, 5)),
    severities: Object.freeze(severities.slice(0, 5)),
    summary: present
      ? `Proactive insights present (${insightIds.length}).`
      : "No proactive insights available.",
    present,
  });
}
